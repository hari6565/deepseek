import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import { buildNodeTree } from './build.ts'
import { parseInput } from './input.ts'

export const name = 'skeleton_maker'
export const inject = ['tools']

// No model call, so nothing to configure: the humantoai result already names every
// control, and the node tree (ids, parents, labels, grid) is computed from it.
export interface Config {}
export const Config: Schema<Config> = Schema.object({})

export function apply(ctx: Context, _config: Config) {
  ctx.tools.register(defineTool({
    name: 'skeleton_maker_generate',
    description:
      'Convert the JSON result of humantoai_generate (a root with groups of "Name as a <type> type" entries) into a '
      + 'full UI node tree { nodeTree: [ <Canvas root> ] } in the same format uf_skeleton_new_generate returns: '
      + 'real nodeIds/nodeParents, labels, nesting and grid placement. Pure transformation, no model call. '
      + 'The result can be passed straight into uf_body_new_generate.',
    parameters: {
      screen: {
        type: 'json',
        required: true,
        description: 'The humantoai_generate result, passed as-is: '
          + '{ "type":"root", "name":"root", "children": { "<group>": { "type":"group", "name":"<group>", "children":["Email as a textinput type", ...] } } }.',
      },
    },
    output: {
      schema: { type: 'json' },
      render: (_args, value) => [{ type: 'text', text: JSON.stringify(value, null, 2) }],
    },
    execute(args) {
      return buildNodeTree(parseInput(args.screen as unknown))
    },
  }))
}
