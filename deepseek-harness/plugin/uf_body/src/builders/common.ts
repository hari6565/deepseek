import type { GroupType, InputNode, WalkNode } from '../types.ts'
import { appearanceFor } from '../templates/appearance.templates.ts'
import { elementInfoFor } from '../templates/element-info.templates.ts'

export const CANVAS_STYLE = { gridAutoRows: '4px', columnGap: '0px', rowGap: '0px' }

/**
 * The `nodeProperty.nodeName` field is a DISPLAY name, not the structural
 * `nodeName` identifier -- it holds `nodeLabel` for every node except root,
 * whose `nodeName` is always "" in the input (per structure.json's own
 * convention) and is echoed back as the fixed display string "Root" instead.
 * Confirmed against a real generated artifact: a node named "addresslabel"
 * with nodeLabel "address" shows nodeProperty.nodeName "address", and a text
 * node named "headline" with nodeLabel "User Form" shows "User Form".
 */
export function nodePropertyName(node: InputNode): string {
  return node.nodeId === 'root' ? 'Root' : node.nodeLabel
}

/** Shared `data: { label, nodeAppearance?, nodeProperty }` block used by NDS and NDU. */
export function buildDataBlock(node: InputNode, groupType: GroupType): Record<string, unknown> {
  const data: Record<string, unknown> = { label: node.nodeLabel }
  const appearance = appearanceFor(node.nodeType, groupType)
  if (appearance) data.nodeAppearance = appearance
  data.nodeProperty = {
    nodeId: node.nodeId,
    nodeName: nodePropertyName(node),
    nodeType: node.nodeType,
    nodeVersion: 'v1',
    elementInfo: elementInfoFor(node, groupType),
  }
  return data
}

/** Shared `grid` block (classNames/style/commonprops/row/column) used by NDS and UFS. */
export function buildGridBlock(node: InputNode, grid: WalkNode['grid']): Record<string, unknown> {
  const isCanvas = node.nodeType === 'Canvas'
  const isContainer = node.nodeType === 'group'
  const result: Record<string, unknown> = {
    classNames: '',
    style: isCanvas || isContainer ? CANVAS_STYLE : {},
  }
  if (node.nodeType === 'label') {
    result.commonprops = { contentAlign: 'left' }
  }
  if (grid.row) result.row = grid.row
  if (grid.column) result.column = grid.column
  return result
}

export function resolveGroupType(node: InputNode, inheritedGroupType: GroupType): GroupType {
  return node.nodeType === 'group' ? node.nodeGroupType ?? 'group' : inheritedGroupType
}
