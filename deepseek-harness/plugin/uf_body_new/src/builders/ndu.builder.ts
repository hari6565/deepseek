import type { InputNode, WalkNode } from '../types.ts'
import { versionTagFor } from '../templates/appearance.templates.ts'
import { buildDataBlock, CANVAS_STYLE, gridToMeta, resolveGroupType } from './common.ts'

const CANVAS_COLUMN_COUNT = 24

/**
 * Builds NDU.json: a map keyed by nodeId, each entry carrying resolved grid
 * `meta` (row/col/rowSpan/colSpan) plus the same appearance/elementInfo data
 * as NDS - the shape the canvas editor reads back for an existing screen.
 */
export function buildNdu(root: InputNode, walked: WalkNode[]): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  // Tracks which table (by its nodeId) we've already emitted a "primary" column
  // for, so only the first column of each table gets primary:true - scoped to
  // this single build call, never shared across requests.
  const firstColumnSeenFor = new Set<string>()

  for (const w of walked) {
    out[w.node.nodeId] =
      w.node.nodeId === 'root' ? buildRootEntry(root) : buildEntry(w, firstColumnSeenFor)
  }
  return out
}

/**
 * Unlike uf_body, there is no computed auto-layout to read rowCount from --
 * the canvas height is derived from the real row extents the input already
 * carries on its top-level containers.
 */
function canvasRowCount(root: InputNode): number {
  let maxEnd = 0
  for (const topLevel of root.children ?? []) {
    const end = topLevel.grid.row?.end
    if (typeof end === 'number' && end > maxEnd) maxEnd = end
  }
  return Math.max(100, maxEnd + 10)
}

function buildRootEntry(root: InputNode): Record<string, unknown> {
  const rowCount = canvasRowCount(root)
  return {
    id: root.nodeId,
    Parent: 'root',
    type: root.nodeType,
    T_parentId: 'root',
    children: (root.children ?? []).map((c) => c.nodeId),
    data: buildDataBlock(root, 'group'),
    grid: { style: CANVAS_STYLE, classNames: '' },
    property: {
      name: '',
      nodeType: root.nodeType,
      description: '',
      rowHeight: '4px',
      rowGap: '0px',
      columnGap: '0px',
      props: { meta: { row: 1, col: 1, rowSpan: CANVAS_COLUMN_COUNT, colSpan: CANVAS_COLUMN_COUNT } },
      rowCount,
      columnCount: CANVAS_COLUMN_COUNT,
    },
    groupType: 'group',
  }
}

function buildEntry(w: WalkNode, firstColumnSeenFor: Set<string>): Record<string, unknown> {
  const { node, parentId, inheritedGroupType } = w
  const isContainer = Boolean(node.children)
  const groupType = resolveGroupType(node, inheritedGroupType)

  const gridBlock: Record<string, unknown> = { style: isContainer ? CANVAS_STYLE : {}, classNames: '' }
  // Matches buildGridBlock (used by NDS/UFS) -- NDU builds its grid block
  // separately and would otherwise miss this (see uf_body's own fix).
  if (node.nodeType === 'label') gridBlock.commonprops = { contentAlign: 'left' }

  return {
    id: node.nodeId,
    parent: parentId,
    type: node.nodeType,
    T_parentId: parentId,
    children: (node.children ?? []).map((c) => c.nodeId),
    property: buildProperty(node, groupType, parentId, firstColumnSeenFor),
    grid: gridBlock,
    groupType,
    data: buildDataBlock(node, groupType),
    version: versionTagFor(node.nodeType, groupType),
    t_parentId: parentId,
  }
}

function buildProperty(
  n: InputNode,
  groupType: string,
  parentId: string,
  firstColumnSeenFor: Set<string>,
): Record<string, unknown> {
  if (n.nodeType === 'column') {
    const isPrimary = !firstColumnSeenFor.has(parentId)
    firstColumnSeenFor.add(parentId)
    return {
      id: n.nodeId,
      name: n.nodeName,
      displayName: 'column',
      className: '',
      placeholder: '—',
      align: 'start',
      primary: isPrimary,
      nodeType: 'column',
      description: '',
    }
  }
  const meta = gridToMeta(n.grid)
  return {
    name: n.nodeName,
    nodeType: n.nodeType === 'group' && groupType === 'table' ? 'table' : n.nodeType,
    description: '',
    ...(meta ? { props: { meta } } : {}),
  }
}
