import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { normalizeScreen } from './catalog.ts'
import type { Result } from './catalog.ts'
import { SYSTEM_PROMPT } from './system-prompt.ts'

export const name = 'humantoai'
export const inject = ['tools']

export interface Config {
  /** Base URL of the OpenAI-compatible API; "/chat/completions" is appended if missing. */
  apiUrl: string
  /** Bearer token. Required, no default -- a live credential, never hardcoded. */
  apiKey: string
  /** Model name as your provider names it. Prefer a pinned model over a router like "openrouter/free". */
  model: string
  temperature: number
  timeoutMs: number
  /** System message. Defaults to the bundled rules + the two examples from newtoolprompt.txt. */
  systemPrompt: string
  /** Cap on generated tokens ("max_tokens"). 0 omits the field. */
  maxTokens: number
  /** Tries per model call for transient failures: empty/truncated completions, HTTP 429 and 5xx. */
  maxAttempts: number
  /** How many times to feed validation errors back to the model for a corrected answer. */
  maxRepairAttempts: number
}

export const Config: Schema<Config> = Schema.object({
  apiUrl: Schema.string().required(),
  apiKey: Schema.string().required(),
  model: Schema.string().required(),
  temperature: Schema.number().default(0),
  timeoutMs: Schema.number().default(120_000),
  systemPrompt: Schema.string().default(SYSTEM_PROMPT),
  maxTokens: Schema.number().default(4096),
  maxAttempts: Schema.number().default(3),
  maxRepairAttempts: Schema.number().default(2),
})

// --- model output parsing ---------------------------------------------------

function stripCodeFences(text: string): string {
  const trimmed = text.trim()
  const match = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed)
  return match ? match[1] : trimmed
}

/** The whole reply if it's JSON, else the substring from the first "{" to the last "}" (models add prose). */
export function extractJsonObject(text: string): string {
  const stripped = stripCodeFences(text)
  try {
    JSON.parse(stripped)
    return stripped
  } catch {
    // fall through to substring extraction
  }
  const start = stripped.indexOf('{')
  const end = stripped.lastIndexOf('}')
  return start !== -1 && end > start ? stripped.slice(start, end + 1) : stripped
}

// --- model call -------------------------------------------------------------

interface ChatMessage { role: 'system' | 'user' | 'assistant'; content: string }
interface ChatCompletionsResponse {
  model?: string
  choices?: Array<{ finish_reason?: string, message?: { content?: string | null } }>
  [key: string]: unknown
}

function chatCompletionsUrl(base: string): string {
  const trimmed = base.replace(/\/+$/, '')
  return trimmed.endsWith('/chat/completions') ? trimmed : `${trimmed}/chat/completions`
}

/** One logical model call, retried on empty/truncated replies and 429/5xx. */
async function complete(config: Config, model: string, messages: ChatMessage[], signal: AbortSignal): Promise<string> {
  const endpoint = chatCompletionsUrl(config.apiUrl)
  const maxAttempts = Math.max(1, Math.floor(config.maxAttempts))
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const isLast = attempt === maxAttempts
    let response: Response
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${config.apiKey}` },
        body: JSON.stringify({
          model,
          temperature: config.temperature,
          ...(config.maxTokens > 0 ? { max_tokens: config.maxTokens } : {}),
          messages,
        }),
        signal,
      })
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      throw new Error(`humantoai: could not reach the model API at ${endpoint} using model "${model}": ${message}.`)
    }
    if (!response.ok) {
      if (!isLast && (response.status === 429 || response.status >= 500)) {
        await new Promise(resolve => setTimeout(resolve, 1500 * attempt))
        continue
      }
      const body = await response.text().catch(() => '')
      throw new Error(`humantoai: model API at ${endpoint} responded ${String(response.status)} ${response.statusText}${body ? `: ${body.slice(0, 500)}` : ''}`)
    }
    const data = await response.json() as ChatCompletionsResponse
    const choice = data.choices?.[0]
    const content = choice?.message?.content
    const truncated = choice?.finish_reason === 'length'
    if (typeof content === 'string' && content.length > 0 && !truncated) return content
    if (isLast) {
      throw new Error(
        `humantoai: the model returned ${truncated ? 'a response cut off by the token limit' : 'no content'} on all `
        + `${String(maxAttempts)} attempts (served by "${data.model ?? model}", finish_reason "${choice?.finish_reason ?? 'unknown'}", `
        + `maxTokens ${String(config.maxTokens)}). That model is too small or too slow; pin a stronger model in cordis.yml `
        + `instead of a router like "openrouter/free", or raise maxTokens.`,
      )
    }
  }
  throw new Error('humantoai: unreachable') // loop always returns or throws
}

// --- plugin -----------------------------------------------------------------

export function apply(ctx: Context, config: Config) {
  ctx.tools.register(defineTool({
    name: 'humantoai_generate',
    description:
      'Turn a SHORT human request for a screen (e.g. "User registration Form", "User Dashboard Screen") into the '
      + 'components it needs, picked from the harness\'s 46 controls and returned as '
      + '{ type:"root", name:"root", children:{ <group>: { type:"group", name, children:["Field_name as a <type> type", ...] } } }. '
      + 'Pass the user\'s request as-is; do NOT list fields yourself -- this tool decides the components.',
    parameters: {
      prompt: {
        type: 'string',
        required: true,
        description: 'The short screen request exactly as the user said it, e.g. "User registration Form".',
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
        () => controller.abort(new Error(`humantoai: generation timed out after ${String(config.timeoutMs)}ms`)),
        config.timeoutMs,
      )

      try {
        const conversation: ChatMessage[] = [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: `Request: ${args.prompt}\n\nRespond with the JSON object only.` },
        ]
        const maxRounds = Math.max(0, Math.floor(config.maxRepairAttempts)) + 1
        for (let round = 1; round <= maxRounds; round++) {
          const raw = await complete(config, "openrouter/free", conversation, controller.signal)
          let result: Result
          try {
            result = normalizeScreen(JSON.parse(extractJsonObject(raw)))
          } catch (cause) {
            const message = cause instanceof Error ? cause.message : String(cause)
            result = { errors: [`the reply was not valid JSON (${message}).`], warnings: [], repairs: [] }
          }
          if (result.screen) return result.screen
          if (round === maxRounds) {
            throw new Error(
              `humantoai: the model's answer still failed validation after ${String(round)} attempt(s):\n- `
              + `${result.errors.slice(0, 20).join('\n- ')}\nLast raw output: ${raw.slice(0, 1500)}`,
            )
          }
          conversation.push(
            { role: 'assistant', content: raw },
            {
              role: 'user',
              content: `That answer has problems:\n- ${result.errors.slice(0, 20).join('\n- ')}\n\n`
                + 'Reply again with the COMPLETE corrected JSON object only.',
            },
          )
        }
        throw new Error('humantoai: unreachable') // loop always returns or throws
      } finally {
        clearTimeout(timer)
        exec.signal.removeEventListener('abort', onAbort)
      }
    },
  }))
}
