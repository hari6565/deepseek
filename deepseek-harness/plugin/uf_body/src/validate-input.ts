import type { GenerateJsonRequest, InputNode, NodeType } from './types.ts'

const VALID_NODE_TYPES: NodeType[] = [
  'Canvas',
  'group',
  'button',
  'text',
  'label',
  'textinput',
  'textarea',
  'column',
]

/**
 * Validates the incoming `{ "nodeTree": [...] }` payload against the shape
 * `structure.json` is expected to have, throwing with a specific, actionable
 * message on the first problem found.
 */
export function validateRequest(body: unknown): InputNode {
  if (!body || typeof body !== 'object') {
    throw new Error('uf_body: request body must be a JSON object.')
  }
  const { nodeTree } = body as GenerateJsonRequest
  if (!Array.isArray(nodeTree) || nodeTree.length !== 1) {
    throw new Error('uf_body: "nodeTree" must be an array containing exactly one root node.')
  }

  const root = nodeTree[0]
  if (!root || root.nodeId !== 'root' || root.nodeType !== 'Canvas') {
    throw new Error(
      'uf_body: nodeTree[0] must be the root node: { "nodeId": "root", "nodeType": "Canvas", ... }.',
    )
  }

  const seenIds = new Set<string>()
  validateNode(root, true)
  return root

  function validateNode(node: InputNode, isRoot: boolean): void {
    if (!node.nodeId || typeof node.nodeId !== 'string') {
      throw new Error(`uf_body: every node needs a non-empty string "nodeId" (found near ${describe(node)}).`)
    }
    if (seenIds.has(node.nodeId)) {
      throw new Error(`uf_body: duplicate nodeId "${node.nodeId}" - every nodeId must be unique.`)
    }
    seenIds.add(node.nodeId)

    if (!VALID_NODE_TYPES.includes(node.nodeType)) {
      throw new Error(
        `uf_body: unknown nodeType "${String(node.nodeType)}" on node "${node.nodeId}". Expected one of: ${VALID_NODE_TYPES.join(', ')}.`,
      )
    }
    if (typeof node.nodeName !== 'string') {
      throw new Error(`uf_body: node "${node.nodeId}" is missing a string "nodeName".`)
    }
    if (typeof node.nodeLabel !== 'string'&& node.nodeId!=='root') {
      throw new Error(`uf_body: node "${node.nodeId}" is missing a string "nodeLabel".`)
    }
    if (!isRoot && !node.nodeParent) {
      throw new Error(`uf_body: node "${node.nodeId}" is missing "nodeParent".`)
    }
    if (node.nodeType === 'group' && node.nodeGroupType !== 'group' && node.nodeGroupType !== 'table') {
      throw new Error(
        `uf_body: group node "${node.nodeId}" needs "nodeGroupType" set to "group" or "table".`,
      )
    }

    for (const child of node.children ?? []) {
      validateNode(child, false)
    }
  }
}

function describe(node: InputNode): string {
  return node?.nodeName ? `node "${node.nodeName}"` : 'an unnamed node'
}
