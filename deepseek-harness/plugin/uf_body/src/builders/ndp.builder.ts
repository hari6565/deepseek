import type { WalkNode } from '../types.ts'
import { elementInfoFor } from '../templates/element-info.templates.ts'
import { nodePropertyName, resolveGroupType } from './common.ts'

/**
 * Builds NDP.json: a map keyed by nodeId of just the "properties" block
 * (nodeId/nodeName/nodeType/nodeVersion/elementInfo) - the flat elementInfo-only
 * view the demo NDP.json carries.
 */
export function buildNdp(walked: WalkNode[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const w of walked) {
    const { node, inheritedGroupType } = w
    const groupType = resolveGroupType(node, inheritedGroupType)
    out[node.nodeId] = {
      nodeId: node.nodeId,
      nodeName: nodePropertyName(node),
      nodeType: node.nodeType,
      nodeVersion: 'v1',
      elementInfo: elementInfoFor(node, groupType),
    }
  }
  return out
}
