// Deterministic ParsedScreen -> uf_skeleton_new-format { nodeTree: [ root ] }.
//
// No model is involved: the humantoai result already says WHAT the controls are,
// so ids, parents, naming and grid placement are computed from the ui-skeleton
// spec (24-column grid, 4px rows) and the reference output in skeleton_maker.txt:
//   label  rows  6-14, 8 tall,  then its input 15-28, 6 rows of gap, next field...

import { randomUUID } from 'node:crypto'
import type { Group, Item, ParsedScreen } from './input.ts'

export interface GridPos { start: number | null, end: number | null }
export interface Grid {
  classNames: string
  style: Record<string, string>
  row?: GridPos | { end: null }
  column?: GridPos | { end: null }
}

export interface SkeletonNode {
  nodeId: string
  nodeType: string
  nodeLabel: string
  nodeName: string
  nodeParent?: string
  nodeGroupType: string
  grid: Grid
  children?: SkeletonNode[]
}

export interface NodeTreeResult { nodeTree: SkeletonNode[] }

// --- layout constants (row units at gridAutoRows 4px) ------------------------
const TOP_PADDING = 6
const BOTTOM_PADDING = 4
const FIELD_GAP = 6        // between one field and the next
const LABEL_GAP = 1        // label -> its control
const GROUP_GAP = 4        // between top-level containers
const COL_START = 2
const COL_END = 24         // one-track gutter inside a container
const TABLE_HEIGHT = 140   // table container (spec: 100-220)

const CONTAINER_STYLE = { gridAutoRows: '4px', columnGap: '0px', rowGap: '0px' }

/** Inputs that get a `label` node immediately before them (spec "label: one per field"). */
const LABELED = new Set([
  'textinput', 'textarea', 'richtexteditor', 'pininput', 'combobox', 'dropdown', 'datepicker', 'timepicker',
  'dateandtime', 'slider', 'radiogroup', 'documentuploader', 'documentuploadpanel', 'signature',
])

const HEIGHTS: Record<string, number> = {
  label: 8, text: 10, divider: 8,
  textinput: 13, dropdown: 13, combobox: 13, datepicker: 13, timepicker: 13, dateandtime: 13, switch: 13,
  checkbox: 13, radio: 13, radiobutton: 13, pininput: 13, slider: 13, documentuploader: 13,
  button: 14,
  radiogroup: 24, textarea: 24,
  icon: 18, avatar: 18,
  card: 20, customwidget: 20, progress: 20, progressbar: 20, text_to_speech: 20, speech_to_text: 20,
  qrcode: 34, signature: 34, list: 34,
  richtexteditor: 60, documentuploadpanel: 60, documentviewer: 60, xmlviewer: 60,
  jsonviewer: 70, jsoneditor: 70, treeviewer: 70, piechart: 70, barchart: 70, linechart: 70, image: 70,
  timeline: 70, dynamicjsonform: 70, advancesearch: 70, pivottable: 70,
}
const heightOf = (type: string): number => HEIGHTS[type] ?? 14

// --- naming -------------------------------------------------------------------
/** "Date_of_birth" -> "Date Of Birth" */
const toWords = (name: string): string =>
  name.split('_').filter(Boolean).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
/** "Date_of_birth" -> "dateofbirth" */
const toKey = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]/g, '')

const freshId = (): string => randomUUID().replace(/-/g, '')

// --- node factories (key order matters: nodeId, nodeType, nodeLabel, nodeName, nodeParent, nodeGroupType, grid, children) ---
function make(
  fields: { type: string, label: string, name: string, parent?: string, groupType: string, grid: Grid, id?: string },
  children?: SkeletonNode[],
): SkeletonNode {
  const node: SkeletonNode = {
    nodeId: fields.id ?? freshId(),
    nodeType: fields.type,
    nodeLabel: fields.label,
    nodeName: fields.name,
    ...(fields.parent !== undefined ? { nodeParent: fields.parent } : {}),
    nodeGroupType: fields.groupType,
    grid: fields.grid,
  } as SkeletonNode
  if (children) node.children = children
  return node
}

const leafGrid = (rowStart: number, rowEnd: number, colStart = COL_START, colEnd = COL_END): Grid => ({
  classNames: '',
  style: {},
  row: { start: rowStart, end: rowEnd },
  column: { start: colStart, end: colEnd },
})

const containerGrid = (rowStart: number, rowEnd: number): Grid => ({
  classNames: '',
  style: { ...CONTAINER_STYLE },
  row: { start: rowStart, end: rowEnd },
  column: { start: 1, end: 25 },
})

/** Column nodes inside a table: order is their screen order, no start keys. */
const columnGrid = (): Grid => ({ classNames: '', style: {}, row: { end: null }, column: { end: null } })

// --- layout of one group ------------------------------------------------------
interface Built { children: SkeletonNode[], height: number }

// --- flow layout: pack controls into aligned rows ----------------------------
//
// Every control belongs to a "pack class" that decides how wide it is and how many
// share a row. Consecutive controls of the same class are packed side by side;
// anything else starts a new row. Every cell in a row starts at the same top row, and
// cell edges always fall on the same column lines (cols 2-12 | 14-24 for pairs), so
// the screen reads as a tidy grid whatever the controls are.
//
//   full   - headings, text, long inputs, uploaders, viewers ... : one per row, cols 2-24
//   field  - ordinary inputs (label + control): up to 2 per row, 10 columns each
//   tile   - cards / widgets: up to 4 per row, balanced, equal widths
//   chart  - charts: up to 2 per row, balanced, equal widths
//   small  - icon / avatar: up to 4 per row, 4 columns each
//   button - buttons: up to 3 per row, 6 columns each, left aligned

type PackClass = 'full' | 'field' | 'tile' | 'chart' | 'small' | 'button'

const USABLE_COLS = COL_END - COL_START // 22
const CELL_GAP = 2                       // empty columns between cells in a row

const PACK_RULES: Record<PackClass, { max: number, fixed?: number }> = {
  full: { max: 1 },
  field: { max: 2, fixed: 10 },
  tile: { max: 4 },
  chart: { max: 2 },
  small: { max: 4, fixed: 4 },
  button: { max: 3, fixed: 6 },
}

const FIELD_TYPES = new Set([
  'textinput', 'dropdown', 'combobox', 'datepicker', 'timepicker', 'dateandtime', 'pininput', 'slider',
  'radiogroup', 'qrcode',
])
const TILE_TYPES = new Set(['card', 'customwidget', 'text_to_speech', 'speech_to_text'])
const CHART_TYPES = new Set(['linechart', 'barchart', 'piechart'])
const SMALL_TYPES = new Set(['icon', 'avatar'])
/** Fields whose content is naturally long get the whole row. */
const WIDE_FIELD_NAME = /address|description|comment|note|message|bio|summary|subject|title|url|link|remark|reason|feedback/i

function packClassOf(item: Item): PackClass {
  if (FIELD_TYPES.has(item.type)) return WIDE_FIELD_NAME.test(item.name) ? 'full' : 'field'
  if (TILE_TYPES.has(item.type)) return 'tile'
  if (CHART_TYPES.has(item.type)) return 'chart'
  if (SMALL_TYPES.has(item.type)) return 'small'
  if (item.type === 'button') return 'button'
  return 'full' // headings, text, dividers, toggles, progress bars, uploaders, viewers, unknown types
}

/** Splits a run of n same-class items into rows: sequential for fixed-width classes, balanced otherwise. */
function rowSizes(n: number, cls: PackClass): number[] {
  const { max, fixed } = PACK_RULES[cls]
  const sizes: number[] = []
  if (fixed !== undefined) {
    for (let left = n; left > 0; left -= max) sizes.push(Math.min(max, left))
    return sizes
  }
  const rows = Math.ceil(n / max)
  const base = Math.floor(n / rows)
  const extra = n % rows
  for (let r = 0; r < rows; r++) sizes.push(base + (r < extra ? 1 : 0))
  return sizes
}

/** Width in columns of each cell in a row holding `count` cells. */
function cellWidth(cls: PackClass, count: number): number {
  const { fixed } = PACK_RULES[cls]
  return fixed ?? Math.floor((USABLE_COLS - CELL_GAP * (count - 1)) / count)
}

function buildFlowChildren(group: Group, parentId: string): Built {
  const children: SkeletonNode[] = []
  let cursor = TOP_PADDING

  /** Emits the node(s) of one item at (top, colStart..colEnd); returns the cell height. */
  const placeCell = (item: Item, index: number, top: number, colStart: number, colEnd: number): number => {
    const key = toKey(item.name)
    const words = toWords(item.name)
    let y = top
    const put = (type: string, label: string, name: string): void => {
      const h = heightOf(type)
      children.push(make({ type, label, name, parent: parentId, groupType: 'group', grid: leafGrid(y, y + h, colStart, colEnd) }))
      y += h
    }
    if (LABELED.has(item.type)) {
      put('label', words, `${key}label`)
      y += LABEL_GAP
      put(item.type, words, key)
    } else if (item.type === 'label') {
      put('label', words, `${key}label`)
    } else if (item.type === 'text') {
      // The first control of a container is its section heading, named "headline" by the spec.
      put('text', words, index === 0 ? 'headline' : key)
    } else {
      put(item.type, words, key)
    }
    return y - top
  }

  const items = group.items
  let i = 0
  while (i < items.length) {
    const cls = packClassOf(items[i])
    let runEnd = i + 1
    while (runEnd < items.length && packClassOf(items[runEnd]) === cls) runEnd++

    let next = i
    const sizes = rowSizes(runEnd - i, cls)
    // One width for the whole run (from its fullest row) so every cell lines up with the ones above it.
    const width = cellWidth(cls, Math.max(...sizes))
    for (const size of sizes) {
      let rowHeight = 0
      for (let c = 0; c < size; c++) {
        const colStart = COL_START + c * (width + CELL_GAP)
        const h = placeCell(items[next], next, cursor, colStart, Math.min(colStart + width, COL_END))
        rowHeight = Math.max(rowHeight, h)
        next++
      }
      cursor += rowHeight + FIELD_GAP
    }
    i = runEnd
  }
  return { children, height: cursor - FIELD_GAP + BOTTOM_PADDING }
}

function buildActionBar(group: Group, parentId: string): Built {
  const n = group.items.length
  const available = COL_END - COL_START
  const width = Math.max(2, Math.min(6, Math.floor((available - (n - 1)) / n)))
  const h = heightOf('button')
  const children = group.items.map((item, i) => {
    const colStart = COL_START + i * (width + 1)
    return make({
      type: item.type,
      label: toWords(item.name),
      name: toKey(item.name),
      parent: parentId,
      groupType: 'group',
      grid: leafGrid(TOP_PADDING, TOP_PADDING + h, colStart, Math.min(colStart + width, 25)),
    })
  })
  return { children, height: TOP_PADDING + h + BOTTOM_PADDING }
}

function buildTableColumns(group: Group, parentId: string): Built {
  const children = group.items.map(item => make({
    type: 'column',
    label: toWords(item.name),
    name: toKey(item.name),
    parent: parentId,
    groupType: 'table',
    grid: columnGrid(),
  }))
  return { children, height: TABLE_HEIGHT }
}

// --- whole screen -------------------------------------------------------------
export function buildNodeTree(screen: ParsedScreen): NodeTreeResult {
  const rootChildren: SkeletonNode[] = []
  let top = 1
  for (const group of screen.groups) {
    const id = freshId()
    const built = group.kind === 'table'
      ? buildTableColumns(group, id)
      : group.kind === 'dynamicactions'
        ? buildActionBar(group, id)
        : buildFlowChildren(group, id)
    const end = top + built.height - 1
    rootChildren.push(make({
      id,
      type: 'group',
      label: group.name,
      name: group.name,
      parent: 'root',
      groupType: group.kind ?? 'group',
      grid: containerGrid(top, end),
    }, built.children))
    top = end + GROUP_GAP
  }

  const root = make({
    id: 'root',
    type: 'Canvas',
    label: '',
    name: '',
    groupType: 'group',
    grid: { classNames: '', style: { ...CONTAINER_STYLE } },
  }, rootChildren)
  return { nodeTree: [root] }
}

// --- self-check (used by tests / available to callers) -------------------------
/** Returns a list of structural problems; empty means the tree satisfies the spec's invariants. */
export function checkTree(result: NodeTreeResult): string[] {
  const problems: string[] = []
  const ids = new Set<string>()
  const visit = (node: SkeletonNode, parent: SkeletonNode | undefined): void => {
    if (ids.has(node.nodeId)) problems.push(`duplicate id ${node.nodeId}`)
    ids.add(node.nodeId)
    if (parent && node.nodeParent !== parent.nodeId) problems.push(`${node.nodeName}: nodeParent mismatch`)
    if (parent && node.nodeId !== 'root' && !/^[0-9a-f]{32}$/.test(node.nodeId)) problems.push(`${node.nodeName}: bad id`)
    const kids = node.children ?? []
    const box = (n: SkeletonNode) => {
      const r = n.grid.row as GridPos | undefined
      const c = n.grid.column as GridPos | undefined
      return r?.start != null && r.end != null && c?.start != null && c.end != null
        ? { r0: r.start, r1: r.end, c0: c.start, c1: c.end }
        : undefined
    }
    const pb = box(node)
    const boxes = kids.map(box)
    kids.forEach((kid, i) => {
      const kb = boxes[i]
      if (kb) {
        if (kb.c0 < 1 || kb.c1 > 25 || kb.c0 >= kb.c1) problems.push(`${kid.nodeName}: bad column span`)
        if (pb && node.nodeType !== 'Canvas' && kb.r1 > pb.r1 - pb.r0 + 1) problems.push(`${kid.nodeName}: exceeds parent height`)
      }
      for (let j = i + 1; j < kids.length; j++) {
        const o = boxes[j]
        if (kb && o && kb.r0 < o.r1 && o.r0 < kb.r1 && kb.c0 < o.c1 && o.c0 < kb.c1) {
          problems.push(`${kid.nodeName} overlaps ${kids[j].nodeName}`)
        }
      }
      visit(kid, node)
    })
  }
  if (result.nodeTree.length !== 1) problems.push('nodeTree must have exactly one root')
  else visit(result.nodeTree[0], undefined)
  return problems
}
