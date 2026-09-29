import type { InputNode, WalkNode } from '../types.ts'
import { versionTagFor } from '../templates/appearance.templates.ts'
import { gridToMeta, type LayoutResult } from '../layout/auto-layout.ts'
import { buildDataBlock, CANVAS_STYLE, resolveGroupType } from './common.ts'

/**
 * Builds NDU.json: a map keyed by nodeId, each entry carrying resolved grid
 * `meta` (row/col/rowSpan/colSpan) plus the same appearance/elementInfo data
 * as NDS - the shape the canvas editor reads back for an existing screen.
 */
export function buildNdu(walked: WalkNode[], layout: LayoutResult): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  // Tracks which table (by its nodeId) we've already emitted a "primary" column
  // for, so only the first column of each table gets primary:true - scoped to
  // this single build call, never shared across requests.
  const firstColumnSeenFor = new Set<string>()

  for (const w of walked) {
    out[w.node.nodeId] =
      w.node.nodeId === 'root' ? buildRootEntry(w, layout) : buildEntry(w, firstColumnSeenFor)
  }
  return out
}

function buildRootEntry(w: WalkNode, layout: LayoutResult): Record<string, unknown> {
  const { node } = w
  return {
    id: node.nodeId,
    Parent: 'root',
    type: node.nodeType,
    T_parentId: 'root',
    children: (node.children ?? []).map((c) => c.nodeId),
    data: buildDataBlock(node, 'group'),
    grid: { style: CANVAS_STYLE, classNames: '' },
    property: {
      name: '',
      nodeType: node.nodeType,
      description: '',
      rowHeight: '4px',
      rowGap: '0px',
      columnGap: '0px',
      props: { meta: { row: 1, col: 1, rowSpan: layout.columnCount, colSpan: layout.columnCount } },
      rowCount: layout.rowCount,
      columnCount: layout.columnCount,
    },
    groupType: 'group',
  }
}

function buildEntry(w: WalkNode, firstColumnSeenFor: Set<string>): Record<string, unknown> {
  const { node, parentId, inheritedGroupType, grid } = w
  const isGroup = node.nodeType === 'group'
  const groupType = resolveGroupType(node, inheritedGroupType)

  const gridBlock: Record<string, unknown> = { style: isGroup ? CANVAS_STYLE : {}, classNames: '' }
  // Matches buildGridBlock (used by NDS/UFS) -- NDU built its grid block
  // separately and missed this, so a label lost its contentAlign here.
  if (node.nodeType === 'label') gridBlock.commonprops = { contentAlign: 'left' }

  return {
    id: node.nodeId,
    parent: parentId,
    type: node.nodeType,
    T_parentId: parentId,
    children: (node.children ?? []).map((c) => c.nodeId),
    property: buildProperty(node, groupType, parentId, grid, firstColumnSeenFor),
    grid: gridBlock,
    groupType,
    data: buildDataBlock(node, groupType),
    version: versionTagFor(node.nodeType, groupType),
    t_parentId: parentId,
  }
}

function buildProperty(
  n: InputNode,
  groupType: 'group' | 'table',
  parentId: string,
  grid: WalkNode['grid'],
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
  const meta = gridToMeta(grid)
  return {
    name: n.nodeName,
    nodeType: n.nodeType === 'group' && groupType === 'table' ? 'table' : n.nodeType,
    description: '',
    ...(meta ? { props: { meta } } : {}),
  }
}
