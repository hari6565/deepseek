import { randomUUID } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { catalogKeyFor, findPropEntry, legalPropNames, loadPropsCatalog, type PropsCatalogFile } from './catalog.ts'

export const name = 'uf_props_edit'
export const inject = ['tools']

// Bundled with the plugin itself (plugin/uf_props_edit/catalog/props/*.json)
// instead of read from an external D:\jsonpreparation\nodes checkout, so the
// plugin is self-contained and works wherever this repo is checked out.
// Computed relative to this file rather than hardcoded so it stays correct
// regardless of where the repo lives on disk.
const DEFAULT_CATALOG_DIR = join(dirname(fileURLToPath(import.meta.url)), '../catalog')

export interface Config {
  /** Base URL of the OpenAI-compatible API. "/chat/completions" is appended automatically. */
  apiUrl: string
  /** Bearer token for the API. Required, no default -- a live credential, never hardcoded. */
  apiKey: string
  /** Model name as your provider names it. */
  model: string
  /** Sampling temperature. 0 favors picking a legal prop/value over creative variation. */
  temperature: number
  /** Generation timeout in milliseconds. */
  timeoutMs: number
  /** Path to the node capability catalog. Defaults to the copy bundled with this plugin. */
  catalogDir: string
  /** Directory each edited bundle is written to as its own JSON file. */
  tempDir: string
}

export const Config: Schema<Config> = Schema.object({
  apiUrl: Schema.string().required(),
  apiKey: Schema.string().required(),
  model: Schema.string().required(),
  temperature: Schema.number().default(0),
  timeoutMs: Schema.number().default(120_000),
  catalogDir: Schema.string().default(DEFAULT_CATALOG_DIR),
  tempDir: Schema.string().default('D:/deepseek/deepseek-harness/plugin/_tempFiles_'),
})

interface UfsEntry {
  id: string
  type: string
  groupType?: string
  name?: string
  label?: string
  elementInfo?: { props?: unknown[], [key: string]: unknown }
  [key: string]: unknown
}

interface Edit {
  nodeId: string
  name: string
  value: unknown
  enabled?: boolean
}

// --- input resolution --------------------------------------------------
function isFilePath(input: string): boolean {
  const trimmed = input.trim()
  const looksLikePath = /^[A-Za-z]:[\\/]/.test(trimmed) || trimmed.startsWith('/')
  if (!looksLikePath) return false
  try {
    return existsSync(trimmed)
  } catch {
    return false
  }
}

/** Accepts a bare UFS array, a full uf_body*_generate bundle ({UFS: [...], ...}), a JSON string, or a file path to either. */
function resolveInput(input: unknown): { bundle: Record<string, unknown> | null, ufs: UfsEntry[] } {
  let value: unknown = input
  if (typeof value === 'string') {
    const trimmed = value.trim()
    value = JSON.parse(isFilePath(trimmed) ? readFileSync(trimmed, 'utf8') : trimmed)
  }
  if (Array.isArray(value)) return { bundle: null, ufs: value as UfsEntry[] }
  if (value && typeof value === 'object' && Array.isArray((value as { UFS?: unknown }).UFS)) {
    const bundle = value as Record<string, unknown>
    return { bundle, ufs: bundle.UFS as UfsEntry[] }
  }
  throw new Error(
    'uf_props_edit: "nodedata" must be a UFS array, a full uf_body*_generate bundle ({ UFS: [...], ... }), '
    + 'or a file path to either.',
  )
}

// --- model call ----------------------------------------------------------
function chatCompletionsUrl(base: string): string {
  const trimmed = base.replace(/\/+$/, '')
  return trimmed.endsWith('/chat/completions') ? trimmed : `${trimmed}/chat/completions`
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed)
  return match ? match[1] : trimmed
}

/** Same defensive extraction as uf_skeleton_new: some models prepend/append stray prose despite instructions. */
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

function buildSystemPrompt(
  nodes: Array<{ nodeId: string, name: string, label: string, type: string, catalogKey: string }>,
  catalogFiles: PropsCatalogFile[],
): string {
  return `You edit UI node props for a low-code canvas. You are given the screen's nodes and, for each `
    + `node kind present, its REAL legal prop schema (retrieved from the node capability catalog) -- the `
    + `exact set of props that kind supports, their types, and allowed values.

Nodes on this screen:
${JSON.stringify(nodes, null, 2)}

Legal prop schema per node kind present (props not listed here do not exist on that kind -- never invent one):
${JSON.stringify(catalogFiles.map((f) => ({ catalogKey: f.nodeKey, props: f.props })), null, 2)}

Rules:
1. Only propose an edit whose "name" appears in that node's catalogKey's props (top-level or nested under subSelection/items). Never invent a prop name.
2. For a "select" or "multiSelect" prop, "value" must be one of that prop's selectionList entries (or {key,label} .key values).
3. For "conditionalBoolean", set the boolean's own "value" to true/false; only propose a nested edit under it (e.g. its subSelection._true.content) if the instruction needs that nested field too, as a SEPARATE edit using that nested prop's own "name".
4. Only edit nodes and props the instruction actually asks about. Do not touch anything else.
5. Respond with ONLY a single valid JSON object, no prose, no markdown fences:
{ "edits": [ { "nodeId": "<id from the node list above>", "name": "<a legal prop name for that node>", "value": <new value>, "enabled": <optional boolean> } ] }`
}

export function apply(ctx: Context, config: Config) {
  ctx.effect(() => {
    const timer = setInterval(() => {
      console.log("[uf_props_edit] heartbeat");
    }, 5000);

    // Runs automatically when the plugin unloads.
    return () => clearInterval(timer);
  });
  ctx.tools.register(defineTool({
    name: 'uf_props_edit_generate',
    description:
      'Edits node props inside a UFS.json (from uf_body_generate / uf_body_new_generate) based on a '
      + 'natural-language instruction. Retrieval-augmented: looks up each node kind\'s REAL prop schema '
      + '(name/type/allowed values) from the node capability catalog before asking the model for new '
      + 'values, and only ever writes back a prop that catalog says is legal -- never invents one.',
    parameters: {
      nodedata: {
        type: 'json',
        required: true,
        description: 'The UFS array, a full uf_body*_generate result ({ NDP, NDS, NDU, UFS, UO }), or a '
          + 'file path to either (e.g. uf_body_new_generate\'s "filePath").',
      },
      instruction: {
        type: 'string',
        required: true,
        description: 'What to change, in plain language, e.g. "Make the delete button red and disable the save button."',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          UFS: { type: 'json', required: true },
          appliedEdits: { type: 'json', required: true },
          skippedEdits: { type: 'json', required: true },
          filePath: { type: 'string' },
        },
      },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    async execute(args, exec) {
      const { bundle, ufs } = resolveInput(args.nodedata)

      // --- retrieval: the distinct node kinds actually on this screen ---
      const nodeSummaries: Array<{ nodeId: string, name: string, label: string, type: string, catalogKey: string }> = []
      const catalogByKey = new Map<string, PropsCatalogFile>()
      for (const entry of ufs) {
        const catalogKey = catalogKeyFor(entry.type, entry.groupType)
        nodeSummaries.push({
          nodeId: entry.id, name: entry.name ?? '', label: entry.label ?? '', type: entry.type, catalogKey,
        })
        if (!catalogByKey.has(catalogKey)) {
          const file = loadPropsCatalog(config.catalogDir, catalogKey)
          if (file) catalogByKey.set(catalogKey, file)
        }
      }

      // --- generation: one model call, constrained to the retrieved schemas ---
      const controller = new AbortController()
      const onAbort = () => controller.abort(exec.signal.reason)
      exec.signal.addEventListener('abort', onAbort)
      const timer = setTimeout(
        () => controller.abort(new Error(`uf_props_edit: generation timed out after ${String(config.timeoutMs)}ms`)),
        config.timeoutMs,
      )

      let raw: string
      try {
        let response: Response
        try {
          response = await fetch(chatCompletionsUrl(config.apiUrl), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
            body: JSON.stringify({
              model: config.model,
              temperature: config.temperature,
              messages: [
                { role: 'system', content: buildSystemPrompt(nodeSummaries, [...catalogByKey.values()]) },
                { role: 'user', content: args.instruction },
              ],
            }),
            signal: controller.signal,
          })
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : String(cause)
          throw new Error(`uf_props_edit: could not reach the model API at ${config.apiUrl}: ${message}.`)
        }
        if (!response.ok) {
          const body = await response.text().catch(() => '')
          throw new Error(
            `uf_props_edit: model API responded ${String(response.status)} ${response.statusText}`
            + (body ? `: ${body.slice(0, 500)}` : ''),
          )
        }
        const data = await response.json() as ChatCompletionsResponse
        const content = data.choices?.[0]?.message?.content
        if (typeof content !== 'string' || content.length === 0) {
          throw new Error(`uf_props_edit: model API response had no choices[0].message.content.`)
        }
        raw = content
      } finally {
        clearTimeout(timer)
        exec.signal.removeEventListener('abort', onAbort)
      }

      let parsed: { edits?: Edit[] }
      try {
        parsed = JSON.parse(extractJsonObject(raw)) as { edits?: Edit[] }
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        throw new Error(`uf_props_edit: model output was not valid JSON (${message}). Raw output: ${raw}`)
      }

      // --- apply: only ever mutate an EXISTING, catalog-legal prop entry ---
      const applied: Edit[] = []
      const skipped: Array<Edit & { reason: string }> = []
      for (const edit of parsed.edits ?? []) {
        const target = ufs.find((e) => e.id === edit.nodeId)
        if (!target) {
          skipped.push({ ...edit, reason: 'no such nodeId in UFS' })
          continue
        }
        const catalogKey = catalogKeyFor(target.type, target.groupType)
        const catalogFile = catalogByKey.get(catalogKey)
        if (!catalogFile || !legalPropNames(catalogFile).has(edit.name)) {
          skipped.push({ ...edit, reason: `"${edit.name}" is not a legal prop for node kind "${catalogKey}"` })
          continue
        }
        const props = target.elementInfo?.props
        const propEntry = Array.isArray(props) ? findPropEntry(props, edit.name) : undefined
        if (!propEntry) {
          skipped.push({ ...edit, reason: `node has no existing "${edit.name}" prop entry to edit` })
          continue
        }
        propEntry.value = edit.value
        if (edit.enabled !== undefined) propEntry.enabled = edit.enabled
        applied.push(edit)
      }

      if (!bundle) {
        return { UFS: ufs, appliedEdits: applied, skippedEdits: skipped }
      }

      bundle.UFS = ufs
      mkdirSync(config.tempDir, { recursive: true })
      const filePath = join(config.tempDir, `${randomUUID()}.json`)
      writeFileSync(filePath, JSON.stringify(bundle, null, 2))
      return { UFS: ufs, appliedEdits: applied, skippedEdits: skipped, filePath }
    },
  }))
}
