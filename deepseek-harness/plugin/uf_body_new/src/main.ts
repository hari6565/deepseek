import { randomUUID } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { Context } from '@deepseek-ai/cordis'
import Schema from '@deepseek-ai/schemastery'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { GenerateJsonRequest, InputNode } from './types.ts'
import { validateRequest } from './validate-input.ts'
import { walkTree } from './builders/walk-tree.ts'
import { buildNdp } from './builders/ndp.builder.ts'
import { buildNds } from './builders/nds.builder.ts'
import { buildNdu } from './builders/ndu.builder.ts'
import { buildUfs } from './builders/ufs.builder.ts'
import { buildUo } from './builders/uo.builder.ts'

export const name = 'uf_body_new'
export const inject = ['tools']

export interface Config {
  /** Tenant/environment codes for UO's "afk" key. Environment-specific: override per deployment. */
  afkClientCode: string
  afkCategoryCode: string
  afkGroupCode: string
  tempDir: string;
}

export const Config: Schema<Config> = Schema.object({
  afkClientCode: Schema.string().default('CT001'),
  afkCategoryCode: Schema.string().default('TGW01'),
  afkGroupCode: Schema.string().default('TGW004'),
  tempDir: Schema.string().default("D:/deepseek/deepseek-harness/plugin/_tempFiles_"),
})

export interface GenerateJsonResult {
  NDP: unknown
  NDS: unknown
  NDU: unknown
  UFS: unknown
  UO: unknown
}

/**
 * The expanded-catalog counterpart to uf_body: derives the five downstream
 * artifacts from a uf_skeleton_new_generate skeleton. Unlike uf_body, the
 * input already carries real `grid` values on every node (uf_skeleton_new's
 * model places them), so there is no auto-layout step here -- and the tree
 * may nest arbitrarily deep rather than uf_body's fixed 3-level shape.
 */
function generate(body: unknown, afk: Config): GenerateJsonResult {
  const root: InputNode = validateRequest(body)

  const walked = walkTree(root)
  const walkedForUfs = walkTree(root, { sortChildrenByGrid: true })

  const artifactName = resolveArtifactName(root, body as GenerateJsonRequest & { artifactName?: string })

  return {
    NDP: buildNdp(walked),
    NDS: buildNds(walked),
    NDU: buildNdu(root, walked),
    UFS: buildUfs(walkedForUfs),
    UO: buildUo(root, { artifactName, ...afk }),
  }
}

function resolveArtifactName(root: InputNode, request: GenerateJsonRequest & { artifactName?: string }): string {
  if (request.artifactName && typeof request.artifactName === 'string') {
    return request.artifactName
  }
  const firstTopLevel = root.children?.[0]
  return firstTopLevel?.nodeName || 'screen'
}

export function apply(ctx: Context, config: Config) {
  ctx.tools.register(defineTool({
    name: 'uf_body_new_generate',
    description:
      'Derive the NDP/NDS/NDU/UFS/UO artifact bundle from a uf_skeleton_new_generate skeleton '
      + '(the expanded ui-skeleton-spec.md node catalog, arbitrary nesting depth, grid taken from '
      + 'the input as-is). Pure structural transformation -- no model call.',
    parameters: {
      nodeTree: {
        type: 'json',
        required: true,
        description: 'Array containing exactly one root node, matching uf_skeleton_new_generate\'s output shape '
          + '(every node already carries its own "grid").',
      },
      artifactName: {
        type: 'string',
        description: 'Optional artifact/screen name. Defaults to the first top-level node\'s nodeName.',
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          NDP: { type: 'json', required: true },
          NDS: { type: 'json', required: true },
          NDU: { type: 'json', required: true },
          UFS: { type: 'json', required: true },
          UO: { type: 'json', required: true },
          filePath: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{
        type: 'text',
        text: `Written to ${value.filePath}\n\n` + JSON.stringify(value, null, 2),
      }],
    },
    async execute(args:any) {
      let ddd: any = [];
      if (typeof args.nodeTree == "string") {
        ddd = JSON.parse(args.nodeTree);
      } else {
        ddd = args.nodeTree;
      }
      const nodeTree = typeof args.nodeTree === 'string' ? JSON.parse(args.nodeTree) as InputNode[] : args.nodeTree as InputNode[]
      const body: GenerateJsonRequest & { artifactName?: string } = {
        nodeTree:ddd,
        artifactName: args.artifactName,
      }
      const response = generate(body, config);

      // Each call gets its own file (not one shared/overwritten path) so
      // multiple screens generated in a row don't clobber each other, and
      // a caller such as uf_preview_generate can be handed just this path
      // instead of re-emitting the whole (often large) JSON blob as an argument.
      mkdirSync(config.tempDir, { recursive: true });
      const filePath = join(config.tempDir, `${randomUUID()}.json`);
      
      writeFileSync(filePath, JSON.stringify(response, null, 2));

      return { ...response, filePath };



    },
  }))
}
