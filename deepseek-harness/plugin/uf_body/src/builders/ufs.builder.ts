import type { WalkNode } from '../types.ts'
import { elementInfoFor } from '../templates/element-info.templates.ts'
import { buildGridBlock, resolveGroupType } from './common.ts'

/**
 * Builds UFS.json: a flat array, each entry's own fields at the top level
 * (no data/property wrapper) plus a `path` ancestor string - ordered by visual
 * position (row, then column) within each container, matching the demo.
 *
 * NOTE: `walked` must come from `walkTree(root, layout, { sortChildrenByGrid: true })`.
 */
export function buildUfs(walked: WalkNode[]): unknown[] {
  return walked.map(buildUfsEntry)
}

function buildUfsEntry(w: WalkNode): Record<string, unknown> {
  const { node, parentId, path, inheritedGroupType, grid } = w
  const isGroup = node.nodeType === 'group'
  const groupType = resolveGroupType(node, inheritedGroupType)

  const entry: Record<string, unknown> = {
    id: node.nodeId,
    type: node.nodeType,
    grid: buildGridBlock(node, grid),
    children: (node.children ?? []).map((c) => c.nodeId),
  }

  if (isGroup) entry.groupType = groupType

  entry.T_parentId = parentId
  entry.path = path
  entry.label = node.nodeLabel
  entry.name = node.nodeName
  // Canvas (root) carries no nodeVersion, matching versionTagFor's own Canvas exception.
  if (node.nodeType !== 'Canvas') entry.nodeVersion = 'v1'
  entry.elementInfo = elementInfoFor(node, groupType)

  return entry
}
