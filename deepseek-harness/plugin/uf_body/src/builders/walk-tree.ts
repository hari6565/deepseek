import type { GroupType, InputNode, NodeGrid, WalkNode } from '../types.ts'
import type { LayoutResult } from '../layout/auto-layout.ts'

/**
 * Flattens the input nodeTree (pre-order, same order the tree was given in) into
 * `WalkNode`s carrying the ancestry context every builder needs: parentId, the
 * nearest group/table's groupType, the `nodeAction` id-path, and the pipe-delimited
 * ancestor `path` - computed the same way the demo's UO.json / UFS.json do:
 *
 *  - path:       "root" for root and for every top-level group; "root|<groupId>"
 *                for anything nested one level under a top-level group.
 *  - nodeAction: ["root"] for root; [selfId] for a top-level group;
 *                [groupId, selfId] for anything nested under one.
 */
export function walkTree(
  root: InputNode,
  layout: LayoutResult,
  options: { sortChildrenByGrid?: boolean } = {},
): WalkNode[] {
  const result: WalkNode[] = []
  const sortChildrenByGrid = options.sortChildrenByGrid ?? false

  function orderedChildren(node: InputNode): InputNode[] {
    const children = node.children ?? []
    if (!sortChildrenByGrid) return children
    // Mirrors the demo's UFS.json ordering: within each container, children are
    // listed by visual position (row, then column) rather than input order -
    // nodes with no position (e.g. table columns) keep their original relative order.
    return [...children]
      .map((child, index) => ({ child, index }))
      .sort((a, b) => {
        const gridA = layout.grids.get(a.child.nodeId) ?? {}
        const gridB = layout.grids.get(b.child.nodeId) ?? {}
        const rowA = gridA.row?.start ?? Number.POSITIVE_INFINITY
        const rowB = gridB.row?.start ?? Number.POSITIVE_INFINITY
        if (rowA !== rowB) return rowA - rowB
        const colA = gridA.column?.start ?? Number.POSITIVE_INFINITY
        const colB = gridB.column?.start ?? Number.POSITIVE_INFINITY
        if (colA !== colB) return colA - colB
        return a.index - b.index
      })
      .map((entry) => entry.child)
  }

  function visit(
    node: InputNode,
    parentId: string,
    parentPath: string,
    parentNodeAction: string[],
    inheritedGroupType: GroupType,
    depth: number,
  ): void {
    const isRoot = node.nodeId === 'root'
    const path = isRoot ? 'root' : parentPath + (parentId === 'root' ? '' : '|' + parentId)
    const nodeAction = isRoot
      ? ['root']
      : [...(parentId === 'root' ? [] : parentNodeAction), node.nodeId]

    const grid: NodeGrid = layout.grids.get(node.nodeId) ?? {}
    result.push({ node, parentId, inheritedGroupType, nodeAction, path, depth, grid })

    const childGroupType: GroupType =
      node.nodeType === 'group' ? (node.nodeGroupType ?? 'group') : inheritedGroupType

    for (const child of orderedChildren(node)) {
      visit(child, node.nodeId, path, nodeAction, childGroupType, depth + 1)
    }
  }

  visit(root, 'root', 'root', ['root'], 'group', 0)
  return result
}
