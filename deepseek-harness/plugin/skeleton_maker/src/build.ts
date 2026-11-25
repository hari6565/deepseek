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

function buildFlowChildren(group: Group, parentId: string): Built {
  const children: SkeletonNode[] = []
  let cursor = TOP_PADDING
  group.items.forEach((item: Item, index) => {
    const key = toKey(item.name)
    const words = toWords(item.name)
    const place = (type: string, label: string, name: string, h = heightOf(type)): void => {
      children.push(make({ type, label, name, parent: parentId, groupType: 'group', grid: leafGrid(cursor, cursor + h) }))
      cursor += h
    }

    if (LABELED.has(item.type)) {
      place('label', words, `${key}label`)
      cursor += LABEL_GAP
      place(item.type, words, key)
    } else if (item.type === 'label') {
      place('label', words, `${key}label`)
    } else if (item.type === 'text') {
      // The first control of a container is its section heading, named "headline" by the spec.
      place('text', words, index === 0 ? 'headline' : key)
    } else {
      place(item.type, words, key)
    }
    cursor += FIELD_GAP
  })
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
