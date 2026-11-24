import { randomInt, randomUUID } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { SYSTEM_PROMPT } from './system-prompt.ts'
import { canonicalize, isObj, validateMessages } from './validate.ts'
import type { Report } from './validate.ts'

export const name = 'a2ui'
export const inject = ['tools']

/** Default output folder: plugin/_tempFiles_, resolved relative to this file so it works in any checkout. */
const DEFAULT_TEMP_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../../_tempFiles_')
const DEFAULT_CATALOG_ID = 'https://copilotkit.ai/a2ui/catalogs/playground/v1'

export interface Config {
  /** Base URL of the OpenAI-compatible API; "/chat/completions" is appended if missing. */
  apiUrl: string
  /** Bearer token. Required, no default -- a live credential, never hardcoded. */
  apiKey: string
  /** Model name as your provider names it. */
  model: string
  temperature: number
  timeoutMs: number
  /** System message. Defaults to the bundled catalog + example matching a2uimodel.json. */
  systemPrompt: string
  /** Written into every surface's "catalogId" (the harness sets it, not the model). */
  catalogId: string
  /** Where each generated surface is written as <uuid>.json. */
  tempDir: string
  /** How many times to feed validation errors back to the model for a corrected attempt. */
  maxRepairAttempts: number
}

export const Config: Schema<Config> = Schema.object({
  apiUrl: Schema.string().required(),
  apiKey: Schema.string().required(),
  model: Schema.string().required(),
  temperature: Schema.number().default(0),
  timeoutMs: Schema.number().default(120_000),
  systemPrompt: Schema.string().default(SYSTEM_PROMPT),
  catalogId: Schema.string().default(DEFAULT_CATALOG_ID),
  tempDir: Schema.string().default(DEFAULT_TEMP_DIR),
  maxRepairAttempts: Schema.number().default(2),
})

// --- model output parsing ---------------------------------------------------

function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed)
  return match ? match[1] : trimmed
}

function fromValue(value: unknown): unknown[] | undefined {
  if (Array.isArray(value)) return value
  if (isObj(value)) {
    if ('createSurface' in value) return [value]
    if (Array.isArray(value.messages)) return value.messages as unknown[]
  }
  return undefined
}

/** Accepts the requested JSON array, a lone message object, or either behind stray prose / code fences. */
export function parseMessages(raw: string): unknown[] {
  const text = stripCodeFences(raw)
  const attempts: string[] = [text]
  const slice = (open: string, close: string): void => {
    const s = text.indexOf(open)
    const e = text.lastIndexOf(close)
    if (s !== -1 && e > s) attempts.push(text.slice(s, e + 1))
  }
  slice('[', ']')
  slice('{', '}')
  for (const candidate of attempts) {
    try {
      const messages = fromValue(JSON.parse(candidate))
      if (messages) return messages
    } catch {
      // try the next shape
    }
  }
  throw new Error('model output contained no parseable A2UI JSON (expected an array with one createSurface message).')
}

// --- model call -------------------------------------------------------------

interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }
interface ChatCompletionsResponse { choices?: Array<{ message?: { content?: string } }>; [key: string]: unknown }

function chatCompletionsUrl(base: string): string {
  const trimmed = base.replace(/\/+$/, '')
  return trimmed.endsWith('/chat/completions') ? trimmed : `${trimmed}/chat/completions`
}

async function chat(config: Config, model: string, messages: ChatMessage[], signal: AbortSignal): Promise<string> {
  const endpoint = chatCompletionsUrl(config.apiUrl)
  let response: Response
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
      body: JSON.stringify({ model, temperature: config.temperature, messages }),
      signal,
    })
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause)
    throw new Error(`a2ui: could not reach the model API at ${endpoint} using model "${model}": ${message}.`)
  }
  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`a2ui: model API at ${endpoint} responded ${String(response.status)} ${response.statusText}${body ? `: ${body.slice(0, 500)}` : ''}`)
  }
  const data = await response.json() as ChatCompletionsResponse
  const content = data.choices?.[0]?.message?.content
  if (typeof content !== 'string' || content.length === 0) {
    throw new Error(`a2ui: model API response had no choices[0].message.content. Raw response: ${JSON.stringify(data).slice(0, 500)}`)
  }
  return content
}

// --- plugin -----------------------------------------------------------------

export function apply(ctx: Context, config: Config) {
  ctx.tools.register(defineTool({
    name: 'a2ui_generate',
    description:
      'Generate an A2UI screen (a single createSurface message with a flat component list: Column, Grid, '
      + 'Section, Heading, Stat, BarChart, PieChart, DataTable, Callout, Markdown, Caption) from a '
      + 'natural-language request. The JSON is validated, written to a file, and returned along with its filePath.',
    parameters: {
      prompt: {
        type: 'string',
        required: true,
        description: 'The UI request, e.g. "Q3 regional sales dashboard with KPI tiles, a bar chart vs target, a pie of share, and a top-products table."',
      },
      surfaceId: {
        type: 'string',
        description: 'Optional surface id. Defaults to a generated "ui-<6 digits>".',
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
      const surfaceId = args.surfaceId ?? `ui-${String(randomInt(100_000, 1_000_000))}`
      const envelope = { surfaceId, catalogId: config.catalogId }

      const controller = new AbortController()
      const onAbort = () => controller.abort(exec.signal.reason)
      exec.signal.addEventListener('abort', onAbort)
      const timer = setTimeout(
        () => controller.abort(new Error(`a2ui: generation timed out after ${String(config.timeoutMs)}ms`)),
        config.timeoutMs,
      )

      let messages: unknown[] = []
      let report: Report | undefined
      let attempts = 0
      try {
        const conversation: ChatMessage[] = [
          { role: 'system', content: config.systemPrompt },
          {
            role: 'user',
            content: `${args.prompt}\n\nUse surfaceId "${surfaceId}" and catalogId "${config.catalogId}". Respond with the JSON array only.`,
          },
        ]
        const maxAttempts = Math.max(0, Math.floor(config.maxRepairAttempts)) + 1
        for (attempts = 1; attempts <= maxAttempts; attempts++) {
          const raw = await chat(config, targetModel, conversation, controller.signal)
          let problems: string[]
          try {
            messages = canonicalize(parseMessages(raw), envelope)
            report = validateMessages(messages)
            problems = report.errors
          } catch (cause) {
            report = undefined
            problems = [cause instanceof Error ? cause.message : String(cause)]
          }
          if (problems.length === 0) break
          if (attempts === maxAttempts) {
            throw new Error(
              `a2ui: the model's output still failed validation after ${String(attempts)} attempt(s):\n- `
              + `${problems.slice(0, 20).join('\n- ')}\nLast raw output: ${raw.slice(0, 1500)}`,
            )
          }
          conversation.push(
            { role: 'assistant', content: raw },
            {
              role: 'user',
              content: `That output has errors:\n- ${problems.slice(0, 20).join('\n- ')}\n\n`
                + 'Reply again with the COMPLETE corrected JSON array only (one createSurface message).',
            },
          )
        }
      } finally {
        clearTimeout(timer)
        exec.signal.removeEventListener('abort', onAbort)
      }

      const filePath = join(resolve(config.tempDir), `${randomUUID()}.json`)
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, `${JSON.stringify(messages, null, 2)}\n`, 'utf8')

      return {
        filePath,
        surfaceId,
        catalogId: config.catalogId,
        componentCount: report?.surfaces[0]?.componentCount ?? 0,
        attempts,
        repairs: report?.repairs ?? [],
        warnings: report?.warnings ?? [],
        a2ui: messages,
      }
    },
  }))
}
