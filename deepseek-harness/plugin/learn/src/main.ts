import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'learn'
export const inject = ['tools']

export function apply(ctx: Context) {
  // Required dependencies are ready before apply runs.
  console.log('[learn] plugin loaded!')

  ctx.effect(() => {
    const timer = setInterval(() => {
      console.log('[learn] heartbeat')
    }, 5000)

    // Runs automatically when the plugin unloads.
    return () => clearInterval(timer)
  })

  ctx.tools.register(defineTool({
    name: 'learn_greet',
    description: 'Greet someone by name.',
    parameters: {
      name: { type: 'string', required: true, description: 'The name to greet' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return `Hello, ${args.name}!`
    },
  }))
}
