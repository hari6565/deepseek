/**
 * Shapes matching the drag-and-drop app's `structure.json` (nodeTree) format,
 * and the five downstream artifacts this module derives from it.
 */

export type NodeType =
  | 'Canvas'
  | 'group'
  | 'button'
  | 'text'
  | 'label'
  | 'textinput'
  | 'textarea'
  | 'column'

export type GroupType = 'group' | 'table'

/** A node exactly as it appears in the incoming `{ "nodeTree": [...] }` payload. */
export interface InputNode {
  nodeId: string
  nodeType: NodeType
  nodeLabel: string
  nodeName: string
  nodeParent?: string
  nodeGroupType?: GroupType
  children?: InputNode[]
}

export interface GenerateJsonRequest {
  nodeTree: InputNode[]
}

/** A node with layout + ancestry context attached during the walk, used by every builder. */
export interface WalkNode {
  node: InputNode
  parentId: string
  /** nodeGroupType of the nearest group/table ancestor (root defaults to "group"). */
  inheritedGroupType: GroupType
  /** ancestor path of nodeIds from the nearest top-level group down to and including this node (root excluded). */
  nodeAction: string[]
  /** pipe-delimited ancestor id path starting at "root", e.g. "root|<groupId>". */
  path: string
  depth: number
  grid: NodeGrid
}

export interface NodeGrid {
  row?: { start?: number, end: number | null }
  column?: { start?: number, end: number | null }
}
