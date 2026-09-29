import type { GroupType, InputNode, WalkNode } from '../types.ts'

/**
 * Flattens the input nodeTree (pre-order, same order the tree was given in)
 * into `WalkNode`s carrying the ancestry context every builder needs:
 * parentId, the nearest container's inherited groupType, the `nodeAction`
 * id-path, and the pipe-delimited ancestor `path`. Unlike uf_body's
 * walkTree, there is no computed layout to consult -- each node's own
 * `grid` (already supplied by the input) is used directly by the builders.
 *
 *  - path:       "root" for root and for every top-level container; "root|<id>"
 *                for anything nested one level under a top-level container.
 *  - nodeAction: ["root"] for root; [selfId] for a top-level container;
 *                [containerId, selfId] for anything nested under one.
 */
export function walkTree(
  root: InputNode,
  options: { sortChildrenByGrid?: boolean } = {},
): WalkNode[] {
  const result: WalkNode[] = []
  const sortChildrenByGrid = options.sortChildrenByGrid ?? false

  function orderedChildren(node: InputNode): InputNode[] {
    const children = node.children ?? []
    if (!sortChildrenByGrid) return children
    // Ordered by real visual position (row, then column) -- the input's own
    // grid IS real design data here, unlike uf_body's heuristic fallback.
    return [...children]
      .map((child, index) => ({ child, index }))
      .sort((a, b) => {
        const rowA = a.child.grid.row?.start ?? Number.POSITIVE_INFINITY
        const rowB = b.child.grid.row?.start ?? Number.POSITIVE_INFINITY
        if (rowA !== rowB) return rowA - rowB
        const colA = a.child.grid.column?.start ?? Number.POSITIVE_INFINITY
        const colB = b.child.grid.column?.start ?? Number.POSITIVE_INFINITY
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

    result.push({ node, parentId, inheritedGroupType, nodeAction, path, depth })

    // A node's own nodeGroupType propagates to its leaves, exactly like
    // uf_body's `node.nodeType === 'group'` check -- generalized here since
    // any container-capable nodeType (not just "group") can define one.
    const childGroupType: GroupType = node.children ? node.nodeGroupType : inheritedGroupType

    for (const child of orderedChildren(node)) {
      visit(child, node.nodeId, path, nodeAction, childGroupType, depth + 1)
    }
  }

  visit(root, 'root', 'root', ['root'], 'group', 0)
  return result
}
