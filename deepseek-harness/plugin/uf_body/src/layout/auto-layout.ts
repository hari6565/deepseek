import type { InputNode, NodeGrid } from '../types.ts'

/**
 * The AI-generated `structure.json` carries no visual position data (no row/column),
 * unlike the hand-built drag-and-drop demo. This computes a reasonable, deterministic
 * vertical-stack layout so every node still gets the row/column grid block the
 * downstream canvas/editor expects - following the same conventions the demo itself
 * uses (24-column canvas, fields starting at column 9, label=2 cols / input=7 cols wide).
 *
 * This is a heuristic, not a pixel-accurate reproduction of any specific hand-tuned
 * layout - it exists so every node has *a* valid, non-overlapping position.
 */

const CANVAS_COLUMN_COUNT = 24
const FIELD_COL_START = 9 // matches the demo's field column convention
const LABEL_COL_SPAN = 2
const WIDE_COL_SPAN = 7 // textinput / textarea / headline width
const BUTTON_COL_SPAN = 2
const BUTTON_COL_STEP = 5 // 2-wide button + 3-col gap

const HEADLINE_HEIGHT = 19
const LABEL_HEIGHT = 10
const TEXTINPUT_HEIGHT = 10
const TEXTAREA_HEIGHT = 29
const BUTTON_HEIGHT = 16

const GAP_AFTER_FIELD = 4
const GAP_BEFORE_BUTTONS = 8
const GAP_BOTTOM_PADDING = 3
const GAP_BETWEEN_TOP_LEVEL_GROUPS = 3
const GROUP_TOP_PADDING = 2
const TABLE_HEIGHT = 128 // columns carry no position of their own, so a table's height is fixed

export interface LayoutResult {
  grids: Map<string, NodeGrid>
  rowCount: number
  columnCount: number
}

export function computeLayout(root: InputNode): LayoutResult {
  const grids = new Map<string, NodeGrid>()
  let rowCursor = 2

  for (const topLevel of root.children ?? []) {
    const groupType = topLevel.nodeGroupType ?? 'group'
    const groupRowStart = rowCursor
    let groupHeight: number

    if (groupType === 'table') {
      groupHeight = TABLE_HEIGHT
      for (const column of topLevel.children ?? []) {
        // Matches the demo exactly: column nodes carry no position of their own.
        grids.set(column.nodeId, { row: { end: null }, column: { end: null } })
      }
    } else {
      let innerCursor = groupRowStart + GROUP_TOP_PADDING
      const buttons: InputNode[] = []

      for (const child of topLevel.children ?? []) {
        if (child.nodeType === 'button') {
          buttons.push(child)
          continue
        }
        const { height, colSpan } = fieldDimensions(child.nodeType)
        grids.set(child.nodeId, {
          row: { start: innerCursor, end: innerCursor + height },
          column: { start: FIELD_COL_START, end: FIELD_COL_START + colSpan },
        })
        innerCursor += height + GAP_AFTER_FIELD
      }

      if (buttons.length > 0) {
        innerCursor += GAP_BEFORE_BUTTONS
        let buttonColStart = FIELD_COL_START
        for (const button of buttons) {
          grids.set(button.nodeId, {
            row: { start: innerCursor, end: innerCursor + BUTTON_HEIGHT },
            column: { start: buttonColStart, end: buttonColStart + BUTTON_COL_SPAN },
          })
          buttonColStart += BUTTON_COL_STEP
        }
        innerCursor += BUTTON_HEIGHT
      }

      groupHeight = innerCursor - groupRowStart + GAP_BOTTOM_PADDING
    }

    grids.set(topLevel.nodeId, {
      row: { start: groupRowStart, end: groupRowStart + groupHeight },
      column: { start: 1, end: 1 + CANVAS_COLUMN_COUNT },
    })

    rowCursor = groupRowStart + groupHeight + GAP_BETWEEN_TOP_LEVEL_GROUPS
  }

  return {
    grids,
    rowCount: Math.max(100, rowCursor + 10),
    columnCount: CANVAS_COLUMN_COUNT,
  }
}

function fieldDimensions(nodeType: InputNode['nodeType']): { height: number, colSpan: number } {
  switch (nodeType) {
    case 'text':
      return { height: HEADLINE_HEIGHT, colSpan: WIDE_COL_SPAN }
    case 'label':
      return { height: LABEL_HEIGHT, colSpan: LABEL_COL_SPAN }
    case 'textarea':
      return { height: TEXTAREA_HEIGHT, colSpan: WIDE_COL_SPAN }
    case 'textinput':
    default:
      return { height: TEXTINPUT_HEIGHT, colSpan: WIDE_COL_SPAN }
  }
}

/** Converts a `{row:{start,end}, column:{start,end}}` grid block into NDU's `{row,col,rowSpan,colSpan}` meta. */
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
