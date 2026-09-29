import type { GroupType, InputNode, NodeGrid } from '../types.ts'
import { appearanceFor } from '../templates/appearance.templates.ts'
import { elementInfoFor } from '../templates/element-info.templates.ts'

export const CANVAS_STYLE = { gridAutoRows: '4px', columnGap: '0px', rowGap: '0px' }

/**
 * The `nodeProperty.nodeName` field is a DISPLAY name, not the structural
 * `nodeName` identifier -- it holds `nodeLabel` for every node except root,
 * whose `nodeName` is always "" in the input and is echoed back as the
 * fixed display string "Root" instead. (Verified against a real generated
 * artifact -- see uf_body's builders/common.ts for the confirming cases.)
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

/**
 * Shared `grid` block (classNames/style/commonprops/row/column) used by NDS
 * and UFS. Unlike uf_body, the input already carries classNames/style
 * (there is no auto-layout to derive them from) -- this only adds the
 * commonprops a label needs, matching uf_body's verified fix.
 */
export function buildGridBlock(node: InputNode): Record<string, unknown> {
  const result: Record<string, unknown> = {
    classNames: node.grid.classNames ?? '',
    style: node.grid.style ?? {},
  }
  if (node.nodeType === 'label') {
    result.commonprops = { contentAlign: 'left' }
  }
  if (node.grid.row) result.row = node.grid.row
  if (node.grid.column) result.column = node.grid.column
  return result
}

/** Converts a node's own `grid.row`/`grid.column` into NDU's `{row,col,rowSpan,colSpan}` meta. */
export function gridToMeta(grid: NodeGrid): { row: number, col: number, rowSpan: number, colSpan: number } | undefined {
  const row = grid.row
  const column = grid.column
  if (!row || !column || row.start == null || column.start == null || row.end == null || column.end == null) {
    return undefined
  }
  return {
    row: row.start,
    col: column.start,
    rowSpan: row.end - row.start,
    colSpan: column.end - column.start,
  }
}

/** A container's own nodeGroupType, or the inherited one for a leaf. Generalizes uf_body's group/table-only check. */
export function resolveGroupType(node: InputNode, inheritedGroupType: GroupType): GroupType {
  return node.children ? node.nodeGroupType : inheritedGroupType
}
