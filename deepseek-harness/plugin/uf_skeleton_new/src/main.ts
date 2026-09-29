import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { SYSTEM_PROMPT } from './system-prompt.ts'

export const name = 'uf_skeleton_new'
export const inject = ['tools']

export interface Config {
  /**
   * Base URL of the OpenAI-compatible API, e.g. "https://openrouter.ai/api/v1"
   * or "https://api.openai.com/v1". "/chat/completions" is appended
   * automatically if not already present.
   */
  apiUrl: string
  /** Bearer token for the API. Required, no default -- a live credential, never hardcoded. */
  apiKey: string
  /** Model name as your provider names it. */
  model: string
  /** Sampling temperature. 0 favors consistent, spec-following JSON over creative variation. */
  temperature: number
  /** Generation timeout in milliseconds. */
  timeoutMs: number
  /** The instructions sent as the system message. Defaults to the resolved ui-skeleton-spec.md rules. */
  systemPrompt: string
}

export const Config: Schema<Config> = Schema.object({
  apiUrl: Schema.string().required(),
  apiKey: Schema.string().required(),
  model: Schema.string().required(),
  temperature: Schema.number().default(0),
  timeoutMs: Schema.number().default(120_000),
  systemPrompt: Schema.string().default(SYSTEM_PROMPT),
})

// --- UI node tree -----------------------------------------------------
// Unlike uf_skeleton's tiny fine-tuned local model, this plugin targets a
// general instruction-following model that the spec asks to generate its
// OWN nodeId/nodeParent. That's usually reliable, but not guaranteed on a
// deep tree -- verify the ids the model produced are actually unique and
// structurally consistent, and only fall back to deriving fresh ones from
// tree position (uf_skeleton's original, unconditional approach) when they
// aren't. This keeps the model's own ids -- meaningful under the resolved
// spec -- whenever they're already correct.

export interface TreeNode {
  nodeId?: string
  nodeType?: string
  nodeLabel?: string
  nodeName?: string
  nodeParent?: string
  nodeGroupType?: string
  grid?: unknown
  children?: TreeNode[]
  [key: string]: unknown
}

export interface NodeTreeResponse {
  nodeTree: TreeNode[]
  [key: string]: unknown
}

function freshId(): string {
  return randomUUID().replace(/-/g, '')
}

/** True if every nodeId is unique and every nodeParent matches its real parent. */
function idsAreConsistent(data: NodeTreeResponse): boolean {
  const seen = new Set<string>()
  let ok = true

  const visit = (node: TreeNode, expectedParentId: string, isRoot: boolean): void => {
    if (!ok || !node || typeof node !== 'object') return
    if (isRoot) {
      if (node.nodeId !== 'root') ok = false
    } else {
      if (!node.nodeId || typeof node.nodeId !== 'string' || seen.has(node.nodeId)) ok = false
      if (node.nodeParent !== expectedParentId) ok = false
    }
    if (typeof node.nodeId === 'string') seen.add(node.nodeId)
    for (const child of node.children ?? []) visit(child, node.nodeId ?? '', false)
  }

  for (const root of data.nodeTree ?? []) visit(root, 'root', true)
  return ok
}

/** Derives nodeId/nodeParent purely from tree position, ignoring whatever the model produced. */
function regenerateIds(data: NodeTreeResponse): NodeTreeResponse {
  const assign = (node: TreeNode, parentId: string): void => {
    if (!node || typeof node !== 'object') return
    node.nodeId = freshId()
    node.nodeParent = parentId
    for (const child of node.children ?? []) assign(child, node.nodeId as string)
  }

  for (const rootNode of data.nodeTree ?? []) {
    if (!rootNode || typeof rootNode !== 'object') continue
    rootNode.nodeId = 'root'
    delete rootNode.nodeParent
    for (const child of rootNode.children ?? []) assign(child, 'root')
  }

  return data
}

/** Defensive cleanup in case the model wraps output in ```json ... ``` fences despite instructions. */
export function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed)
  return match ? match[1] : trimmed
}

/**
 * Some models -- especially free/lower-quality ones behind an aggregator
 * like OpenRouter -- prepend stray prose despite the "respond with ONLY
 * JSON" instruction (observed: a "User Safety: safe" preamble before the
 * actual object). If the whole response isn't valid JSON on its own, fall
 * back to slicing out the substring between the first "{" and the last "}".
 */
function extractJsonObject(text: string): string {
  const stripped = stripCodeFences(text)
  try {
    JSON.parse(stripped)
    return stripped
  } catch {
    // Fall through to substring extraction below.
  }
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  return start !== -1 && end > start ? stripped.slice(start, end + 1) : stripped
}

interface ChatCompletionsResponse {
  choices?: Array<{ message?: { content?: string } }>
  [key: string]: unknown
}

/** Appends "/chat/completions" to a provider base URL unless it's already the full endpoint. */
function chatCompletionsUrl(base: string): string {
  const trimmed = base.replace(/\/+$/, '')
  return trimmed.endsWith('/chat/completions') ? trimmed : `${trimmed}/chat/completions`
}

export function apply(ctx: Context, config: Config) {
  ctx.tools.register(defineTool({
    name: 'uf_skeleton_new_generate',
    description:
      'Generate a UI node tree (form/table/tabs/etc. skeleton) from a natural-language request, '
      + 'via a hosted chat-completions model, following the expanded ui-skeleton-spec.md node catalog '
      + '(many more control types than uf_skeleton_generate, and the model supplies its own nodeId/nodeParent).',
    parameters: {
      prompt: {
        type: 'string',
        required: true,
        description: 'The natural-language UI request, e.g. "Create a customer registration '
          + 'page with fields for Name, Email, Phone Number, Address, Save button, and Cancel button."',
      },
      model: {
        type: 'string',
        description: 'Optional model name override. Defaults to the plugin\'s configured model.',
      },
    },
    output: {
      schema: { type: 'json' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute(args, exec) {
      const targetModel = args.model ?? config.model

      const controller = new AbortController()
      const onAbort = () => controller.abort(exec.signal.reason)
      exec.signal.addEventListener('abort', onAbort)
      const timer = setTimeout(
        () => controller.abort(new Error(`uf_skeleton_new: generation timed out after ${String(config.timeoutMs)}ms`)),
        config.timeoutMs,
      )

      const endpoint = chatCompletionsUrl(config.apiUrl)
      let raw: string
      try {
        let response: Response
        try {
          response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${config.apiKey}`,
            },
            body: JSON.stringify({
              model: targetModel,
              temperature: config.temperature,
              messages: [
                { role: 'system', content: config.systemPrompt },
                { role: 'user', content: args.prompt },
              ],
            }),
            signal: controller.signal,
          })
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : String(cause)
          throw new Error(
            `uf_skeleton_new: could not reach the model API at ${endpoint} using model "${targetModel}": ${message}.`,
          )
        }
        if (!response.ok) {
          const body = await response.text().catch(() => '')
          throw new Error(
            `uf_skeleton_new: model API at ${endpoint} responded ${String(response.status)} ${response.statusText}`
            + (body ? `: ${body.slice(0, 500)}` : ''),
          )
        }
        const data = await response.json() as ChatCompletionsResponse
        const content = data.choices?.[0]?.message?.content
        if (typeof content !== 'string' || content.length === 0) {
          throw new Error(
            `uf_skeleton_new: model API response had no choices[0].message.content. `
            + `Raw response: ${JSON.stringify(data).slice(0, 500)}`,
          )
        }
        raw = content
      } finally {
        clearTimeout(timer)
        exec.signal.removeEventListener('abort', onAbort)
      }

      let parsed: NodeTreeResponse
      try {
        parsed = JSON.parse(extractJsonObject(raw)) as NodeTreeResponse
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        throw new Error(
          `uf_skeleton_new: model output was not valid JSON (${message}). This is a model/generation issue `
          + `(e.g. a truncated or malformed response), not something this tool can repair -- try again, `
          + `or check the model/prompt. Raw output: ${raw}`,
        )
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.nodeTree) || parsed.nodeTree.length === 0) {
        const shape = parsed && typeof parsed === 'object' ? `an object with keys [${Object.keys(parsed).join(', ')}]` : typeof parsed
        throw new Error(
          `uf_skeleton_new: model output parsed as JSON but has no non-empty "nodeTree" array `
          + `(got ${shape}). Expected { "nodeTree": [ <root Canvas node> ] }. Raw output: ${raw}`,
        )
      }

      return idsAreConsistent(parsed) ? parsed : regenerateIds(parsed)
    },
  }))
}
