import { ALL_NODE_TYPES, GROUP_TYPES, isContainerType, type GenerateJsonRequest, type InputNode } from './types.ts'

const VALID_NODE_TYPES = new Set<string>(ALL_NODE_TYPES)
const VALID_GROUP_TYPES = new Set<string>(GROUP_TYPES)

/**
 * Validates the incoming `{ "nodeTree": [...] }` payload against the
 * expanded ui-skeleton-spec.md node model, throwing with a specific,
 * actionable message on the first problem found.
 */
export function validateRequest(body: unknown): InputNode {
  if (!body || typeof body !== 'object') {
    throw new Error('uf_body_new: request body must be a JSON object.')
  }
  const { nodeTree } = body as GenerateJsonRequest
  if (!Array.isArray(nodeTree) || nodeTree.length !== 1) {
    throw new Error('uf_body_new: "nodeTree" must be an array containing exactly one root node.')
  }

  const root = nodeTree[0]
  if (!root || root.nodeId !== 'root' || root.nodeType !== 'Canvas') {
    throw new Error(
      'uf_body_new: nodeTree[0] must be the root node: { "nodeId": "root", "nodeType": "Canvas", ... }.',
    )
  }

  const seenIds = new Set<string>()
  validateNode(root, true)
  return root

  function validateNode(node: InputNode, isRoot: boolean): void {
    if (!node.nodeId || typeof node.nodeId !== 'string') {
      throw new Error(`uf_body_new: every node needs a non-empty string "nodeId" (found near ${describe(node)}).`)
    }
    if (seenIds.has(node.nodeId)) {
      throw new Error(`uf_body_new: duplicate nodeId "${node.nodeId}" - every nodeId must be unique.`)
    }
    seenIds.add(node.nodeId)

    if (!VALID_NODE_TYPES.has(node.nodeType)) {
      throw new Error(
        `uf_body_new: unknown nodeType "${String(node.nodeType)}" on node "${node.nodeId}". `
        + `Expected one of the ui-skeleton-spec.md catalog values.`,
      )
    }
    if (typeof node.nodeName !== 'string') {
      throw new Error(`uf_body_new: node "${node.nodeId}" is missing a string "nodeName".`)
    }
    if (typeof node.nodeLabel !== 'string') {
      throw new Error(`uf_body_new: node "${node.nodeId}" is missing a string "nodeLabel".`)
    }
    if (!isRoot && !node.nodeParent) {
      throw new Error(`uf_body_new: node "${node.nodeId}" is missing "nodeParent".`)
    }
    if (!node.nodeGroupType || !VALID_GROUP_TYPES.has(node.nodeGroupType)) {
      throw new Error(
        `uf_body_new: node "${node.nodeId}" has invalid "nodeGroupType" `
        + `"${String(node.nodeGroupType)}". Expected one of: ${GROUP_TYPES.join(', ')}.`,
      )
    }
    if (!node.grid || typeof node.grid !== 'object') {
      throw new Error(`uf_body_new: node "${node.nodeId}" is missing a "grid" object.`)
    }

    const isContainer = isContainerType(node.nodeType)
    if (isContainer && !Array.isArray(node.children)) {
      throw new Error(`uf_body_new: container node "${node.nodeId}" (${node.nodeType}) needs a "children" array.`)
    }
    if (!isContainer && node.children !== undefined) {
      throw new Error(`uf_body_new: leaf node "${node.nodeId}" (${node.nodeType}) must omit "children".`)
    }

    validateChildrenShape(node)

    for (const child of node.children ?? []) {
      validateNode(child, false)
    }
  }

  function validateChildrenShape(node: InputNode): void {
    const children = node.children ?? []
    const childTypes = children.map((c) => c.nodeType)

    if (node.nodeGroupType === 'table' && node.nodeType === 'group') {
      const nonColumn = childTypes.find((t) => t !== 'column')
      if (nonColumn) {
        throw new Error(`uf_body_new: table node "${node.nodeId}" has a non-column child ("${nonColumn}") -- table children must all be "column".`)
      }
    }
    if (node.nodeType === 'tab_group') {
      const nonHeader = childTypes.find((t) => t !== 'tab_header')
      if (nonHeader) {
        throw new Error(`uf_body_new: tab_group "${node.nodeId}" has a non-tab_header child ("${nonHeader}").`)
      }
    }
    if (node.nodeType === 'tab_header') {
      const nonGroup = childTypes.find((t) => t !== 'group')
      if (nonGroup) {
        throw new Error(`uf_body_new: tab_header "${node.nodeId}" has a non-group child ("${nonGroup}").`)
      }
    }
    if (node.nodeGroupType === 'dynamicactions') {
      const nonButton = childTypes.find((t) => t !== 'button')
      if (nonButton) {
        throw new Error(`uf_body_new: dynamicactions node "${node.nodeId}" has a non-button child ("${nonButton}").`)
      }
    }
    if (node.nodeGroupType === 'hierarchymapper') {
      if (childTypes.length !== 2 || childTypes[0] !== 'hierarchymappertext' || childTypes[1] !== 'hierarchymapperselection') {
        throw new Error(
          `uf_body_new: hierarchymapper node "${node.nodeId}" must have exactly two children, `
          + `[hierarchymappertext, hierarchymapperselection] in that order.`,
        )
      }
    }
    if (node.nodeGroupType === 'subscreen') {
      if (childTypes.length !== 1 || childTypes[0] !== 'group') {
        throw new Error(`uf_body_new: subscreen node "${node.nodeId}" must have exactly one "group" (artifactgroup) child.`)
      }
    }
  }
}

function describe(node: InputNode): string {
  return node?.nodeName ? `node "${node.nodeName}"` : 'an unnamed node'
}
