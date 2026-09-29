/**
 * Shapes matching the expanded ui-skeleton-spec.md node model (see
 * D:\jsonpreparation\plugin_requirement\ui-skeleton-spec.md), the source
 * uf_skeleton_new_generate follows. Unlike uf_body/uf_skeleton's original
 * 8-type catalog and fixed 3-level tree, this model:
 *  - carries `grid` on every input node already (row/column/style) --
 *    there is no auto-layout step here, the input's own grid is used as-is.
 *  - allows arbitrary nesting depth, not a fixed root -> group -> control shape.
 */

/** Container nodeTypes -- the only ones that ever carry `children`. */
export const CONTAINER_NODE_TYPES = ['Canvas', 'group', 'tab_group', 'tab_header', 'table'] as const

/** Leaf (control) nodeTypes -- never carry `children`. */
export const LEAF_NODE_TYPES = [
  'hierarchymappertext', 'hierarchymapperselection',
  'textinput', 'textarea', 'richtexteditor', 'pininput', 'combobox', 'dropdown', 'label', 'text',
  'datepicker', 'timepicker', 'dateandtime',
  'checkbox', 'switch', 'radio', 'radiogroup', 'radiobutton', 'slider',
  'button',
  'documentuploader', 'documentuploadpanel', 'documentviewer', 'image', 'signature', 'qrcode', 'avatar', 'icon',
  'column', 'list', 'card', 'pivottable', 'timeline', 'treeviewer', 'progress', 'progressbar', 'divider',
  'jsonviewer', 'jsoneditor', 'xmlviewer', 'dynamicjsonform', 'advancesearch',
  'piechart', 'barchart', 'linechart',
  'text_to_speech', 'speech_to_text',
  'customwidget',
] as const

export const ALL_NODE_TYPES = [...CONTAINER_NODE_TYPES, ...LEAF_NODE_TYPES] as const

export type NodeType = (typeof ALL_NODE_TYPES)[number]

export const GROUP_TYPES = ['group', 'table', 'hierarchymapper', 'subscreen', 'artifactgroup', 'grouparray', 'dynamicactions'] as const

export type GroupType = (typeof GROUP_TYPES)[number]

export interface NodeGrid {
  classNames?: string
  style?: Record<string, unknown>
  row?: { start?: number | null, end: number | null }
  column?: { start?: number | null, end: number | null }
}

/** A node exactly as it appears in the incoming `{ "nodeTree": [...] }` payload. */
export interface InputNode {
  nodeId: string
  nodeType: NodeType
  nodeLabel: string
  nodeName: string
  nodeParent?: string
  nodeGroupType: GroupType
  grid: NodeGrid
  children?: InputNode[]
}

export interface GenerateJsonRequest {
  nodeTree: InputNode[]
}

/** A node with ancestry context attached during the walk, used by every builder. */
export interface WalkNode {
  node: InputNode
  parentId: string
  /** nodeGroupType of the nearest group/table/... ancestor (root defaults to "group"). */
  inheritedGroupType: GroupType
  /** ancestor path of nodeIds from the nearest top-level container down to and including this node (root excluded). */
  nodeAction: string[]
  /** pipe-delimited ancestor id path starting at "root", e.g. "root|<groupId>". */
  path: string
  depth: number
}

export function isContainerType(nodeType: NodeType): boolean {
  return (CONTAINER_NODE_TYPES as readonly string[]).includes(nodeType)
}
