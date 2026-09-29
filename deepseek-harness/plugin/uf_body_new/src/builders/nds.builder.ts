import type { WalkNode } from '../types.ts'
import { versionTagFor } from '../templates/appearance.templates.ts'
import { buildDataBlock, buildGridBlock, resolveGroupType } from './common.ts'

/**
 * Builds NDS.json: a flat array (pre-order/tree order) of full canvas-node
 * records - the richest single-node view (appearance + position + elementInfo).
 */
export function buildNds(walked: WalkNode[]): unknown[] {
  return walked.map(buildNdsEntry)
}

function buildNdsEntry(w: WalkNode): Record<string, unknown> {
  const { node, parentId, inheritedGroupType } = w
  const isCanvas = node.nodeType === 'Canvas'
  const isContainer = Boolean(node.children)
  const groupType = resolveGroupType(node, inheritedGroupType)

  const entry: Record<string, unknown> = {
    id: node.nodeId,
    parent: parentId,
    T_parentId: parentId,
    type: node.nodeType,
    children: (node.children ?? []).map((c) => c.nodeId),
    data: buildDataBlock(node, groupType),
    property: {
      name: isCanvas ? '' : node.nodeName,
      nodeType: node.nodeType === 'group' && groupType === 'table' ? 'table' : node.nodeType,
      description: '',
    },
    grid: buildGridBlock(node),
  }

  if (isContainer) entry.groupType = groupType

  const version = versionTagFor(node.nodeType, groupType)
  if (version) entry.version = version

  return entry
}
