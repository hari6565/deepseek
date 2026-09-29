import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'uf_skeleton'
export const inject = ['tools']

export interface Config {
  /** Base URL of the local Ollama server. */
  baseUrl: string
  /** Default model name, used when a call omits `model`. */
  model: string
  /** Generation timeout in milliseconds. */
  timeoutMs: number
}

export const Config: Schema<Config> = Schema.object({
  baseUrl: Schema.string().default('http://192.168.2.99:11434'),
  model: Schema.string().default('testmodel'),
  timeoutMs: Schema.number().default(120_000),
})

// --- UI node tree -----------------------------------------------------
// The model is never asked to produce nodeId/nodeParent: a small
// fine-tuned model asked to hallucinate a "unique random-looking" hex id
// is unreliable at it (repeats one id across sibling nodes, or degrades
// into non-hex garbage on longer generations). A node's parent is already
// fully implied by which node's `children` array it sits in, so this adds
// nodeId/nodeParent back in AFTER generation, purely from the JSON's real
// nesting structure -- reliable regardless of model quality.

export type TreeNode = {
  nodeType?: string
  nodeLabel?: string
  nodeName?: string
  nodeGroupType?: string
  children?: TreeNode[]
  nodeId?: string
  nodeParent?: string
}

export type NodeTreeResponse = {
  nodeTree: TreeNode[]
}

/** 32-character lowercase hex string, no dashes. */
function freshId(): string {
  return randomUUID().replace(/-/g, '')
}

/**
 * Walks data.nodeTree and assigns every node a fresh nodeId, and every
 * non-root node a nodeParent pointing at its actual parent's new id --
 * derived purely from tree position. Mutates and returns `data`.
 */
export function injectNodeIds(data: NodeTreeResponse): NodeTreeResponse {
  const assign = (node: TreeNode, parentId: string): TreeNode => {
    if (!node || typeof node !== 'object') return node
    node.nodeId = freshId()
    node.nodeParent = parentId
    if (node.children) node.children = node.children.map(child => assign(child, node.nodeId as string))
    return node
  }

  data.nodeTree = (data.nodeTree ?? []).map((rootNode) => {
    if (!rootNode || typeof rootNode !== 'object') return rootNode
    // Per schema, the top-level Canvas node's id is always the literal
    // "root", and it has no nodeParent key at all.
    rootNode.nodeId = 'root'
    delete rootNode.nodeParent
    if (rootNode.children) rootNode.children = rootNode.children.map(child => assign(child, 'root'))
    return rootNode
  })

  return data
}

/** Defensive cleanup in case the model wraps output in ```json ... ``` fences. */
export function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed)
  return match ? match[1] : trimmed
}

interface OllamaGenerateResponse {
  model: string
  created_at: string
  response: string
  done: boolean
  [key: string]: unknown
}

export function apply(ctx: Context, config: Config) {
  ctx.effect(() => {
    const timer = setInterval(() => {
      console.log('[uf_skeleton_generate] heartbeat')
    }, 5000)

    // Runs automatically when the plugin unloads.
    return () => clearInterval(timer)
  })
  ctx.tools.register(defineTool({
    name: 'uf_skeleton_generate',
    description:
      'Generate a UI node tree (form/table skeleton) from a natural-language request, '
      + 'via a local fine-tuned model served by Ollama.',
    parameters: {
      prompt: {
        type: 'string',
        required: true,
        description: 'The natural-language UI request, e.g. "Create a customer registration '
          + 'page with fields for Name, Email, Phone Number, Address, Save button, and Cancel button."',
      },
      model: {
        type: 'string',
        description: 'Optional Ollama model name override. Defaults to the plugin\'s configured model.',
      },
    },
    output: {
      schema: { type: 'json' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute(args, exec) {
      const targetModel = args.model ?? config.model
      console.log("called");
      

      const controller = new AbortController()
      const onAbort = () => controller.abort(exec.signal.reason)
      exec.signal.addEventListener('abort', onAbort)
      const timer = setTimeout(() => controller.abort(new Error(`uf_skeleton: generation timed out after ${String(config.timeoutMs)}ms`)), config.timeoutMs)

      let raw: string
      try {
        let response: Response
        try {
          response = await fetch(`${config.baseUrl}/api/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: targetModel, prompt: args.prompt, stream: false }),
            signal: controller.signal,
          })
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : String(cause)
          throw new Error(
            `uf_skeleton: could not reach Ollama at ${config.baseUrl} using model "${targetModel}": ${message}. `
            + `Is Ollama running, and has this model been created (\`ollama create ${targetModel} -f Modelfile\`)?`,
          )
        }
        if (!response.ok) {
          throw new Error(
            `uf_skeleton: Ollama at ${config.baseUrl} responded ${String(response.status)} ${response.statusText} for model "${targetModel}"`,
          )
        }
        const data = await response.json() as OllamaGenerateResponse
        raw = data.response
      } finally {
        clearTimeout(timer)
        exec.signal.removeEventListener('abort', onAbort)
      }

      let parsed: NodeTreeResponse
      try {
        parsed = JSON.parse(stripCodeFences(raw)) as NodeTreeResponse
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        throw new Error(
          `uf_skeleton: model output was not valid JSON (${message}). This is a model/generation issue `
          + `(e.g. a truncated or malformed response), not something this tool can repair -- try again, `
          + `or check the model itself. Raw output: ${raw}`,
        )
      }

      // injectNodeIds only ever touches data.nodeTree; a model that emits the
      // root node bare, or under a different key, would otherwise pass through
      // untouched with no nodeId/nodeParent and no error at all. Fail loudly
      // instead of silently returning an unmodified tree.
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.nodeTree) || parsed.nodeTree.length === 0) {
        const shape = parsed && typeof parsed === 'object' ? `an object with keys [${Object.keys(parsed).join(', ')}]` : typeof parsed
        throw new Error(
          `uf_skeleton: model output parsed as JSON but has no non-empty "nodeTree" array to inject ids into `
          + `(got ${shape}). Expected { "nodeTree": [ <root Canvas node> ] }. Raw output: ${raw}`,
        )
      }

      return injectNodeIds(parsed)
    },
  }))
}
