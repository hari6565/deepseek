import type { GroupType, InputNode } from '../types.ts'
import { elementInfoFor } from '../templates/element-info.templates.ts'
import { resolveGroupType } from './common.ts'

/**
 * Builds UO.json: the composite "artifact" bundle - mappedData (code-gen
 * shape), securityData (access-control shape), targetItems (a flattened
 * elementInfo tree), and nodeTree (the input tree echoed back with
 * nodeAction added).
 *
 * uf_body's original assumed a fixed root -> group/table -> control shape
 * (a comment there says as much); ui-skeleton-spec.md allows arbitrary
 * nesting, so every one of these now recurses to whatever depth the input
 * actually has, generalizing but NOT changing the verified per-node shape
 * observed one level deep in sample_corect.json.
 */

const ACTION_BLOCK = (): Record<string, unknown> => ({
  lock: { lockMode: '', name: '', ttl: '' },
  stateTransition: { sourceQueue: '', sourceStatus: '', targetQueue: '', targetStatus: '' },
  pagination: { page: '1', count: '10' },
  encryption: { isEnabled: false, selectedDpd: '', encryptionMethod: '' },
  events: {},
})

export interface UoOptions {
  /** Artifact/screen name - defaults to the first top-level node's nodeName. */
  artifactName: string
  /** Tenant/environment codes for the "afk" key. Environment-specific: override per deployment. */
  afkClientCode: string
  afkCategoryCode: string
  afkGroupCode: string
}

export function buildUo(root: InputNode, options: UoOptions): Record<string, unknown> {
  const { artifactName } = options
  return {
    mappedData: buildMappedData(root, artifactName),
    securityData: buildSecurityData(root, artifactName, options),
    targetItems: buildTargetItems(root),
    nodeTree: [buildNodeTreeEcho(root, 'root', 'group', ['root'])],
  }
}

// ---------------------------------------------------------------------------
// mappedData
// ---------------------------------------------------------------------------
function buildMappedData(root: InputNode, artifactName: string): Record<string, unknown> {
  return {
    artifact: {
      name: artifactName,
      action: ACTION_BLOCK(),
      code: '',
      testCode: '',
      rule: {},
      events: {},
      mapper: [],
      node: [buildMappedRootNode(root), ...(root.children ?? []).map(buildMappedTopLevelNode)],
    },
  }
}

function buildMappedRootNode(root: InputNode): Record<string, unknown> {
  return {
    nodeId: root.nodeId,
    nodeName: root.nodeType,
    nodeType: root.nodeType,
    parentId: 'root',
    path: 'root',
    action: ACTION_BLOCK(),
    code: '',
    testCode: '',
    rule: {},
    events: {},
    mapper: [],
    objElements: [],
  }
}

function buildMappedTopLevelNode(node: InputNode): Record<string, unknown> {
  return {
    nodeId: node.nodeId,
    nodeName: node.nodeName,
    nodeType: node.nodeType,
    nodeVersion: 'v1',
    parentId: 'root',
    path: 'root',
    action: ACTION_BLOCK(),
    code: '',
    testCode: '',
    rule: {},
    events: {},
    mapper: [],
    objElements: (node.children ?? []).map((child) => buildMappedElement(child, node.nodeId, `root|${node.nodeId}`)),
  }
}

/** Recurses -- the verified sample only showed one level of these, but nothing about the shape assumes a leaf. */
function buildMappedElement(node: InputNode, parentId: string, path: string): Record<string, unknown> {
  return {
    elementName: node.nodeName,
    elementId: node.nodeId,
    elementType: node.nodeType,
    elementVersion: 'v1',
    parentId,
    path,
    action: ACTION_BLOCK(),
    code: '',
    testCode: '',
    rule: {},
    events: {},
    mapper: [],
    objElements: (node.children ?? []).map((child) => buildMappedElement(child, node.nodeId, `${path}|${node.nodeId}`)),
  }
}

// ---------------------------------------------------------------------------
// securityData
// ---------------------------------------------------------------------------
const SI_FLAG_SELECTION = ['AA', 'BA', 'ATO', 'BTO']

function siFlag(selectedValue: 'AA' | 'ATO'): Record<string, unknown> {
  return { uiType: 'dropdown', selectedValue, selectionList: SI_FLAG_SELECTION }
}

function buildSecurityData(
  root: InputNode,
  artifactName: string,
  afk: Pick<UoOptions, 'afkClientCode' | 'afkCategoryCode' | 'afkGroupCode'>,
): Record<string, unknown> {
  return {
    accessProfile: [],
    securityTemplate: {
      security: {
        artifact: {
          resource: artifactName,
          resourceId: artifactName,
          SIFlag: { uiType: 'dropdown', selectedValue: 'AA', selectionList: ['AA', 'BA'] },
          node: [buildSecurityRootNode(root), ...(root.children ?? []).map(buildSecurityTopLevelNode)],
        },
      },
    },
    afk: `CK:${afk.afkClientCode}:FNGK:AF:FNK:UF-UFW:CATK:${afk.afkCategoryCode}:AFGK:${afk.afkGroupCode}:AFK:${artifactName}:AFVK:v1`,
  }
}

function buildSecurityRootNode(root: InputNode): Record<string, unknown> {
  return {
    resource: root.nodeType,
    resourceId: root.nodeId,
    resourceType: root.nodeType,
    resourceParentId: 'root',
    resourcePath: 'root',
    SIFlag: siFlag('AA'),
    objElements: [],
  }
}

function buildSecurityTopLevelNode(node: InputNode): Record<string, unknown> {
  return {
    resource: node.nodeName,
    resourceId: node.nodeId,
    resourceType: node.nodeType,
    resourceParentId: 'root',
    resourcePath: 'root',
    SIFlag: siFlag('AA'),
    objElements: (node.children ?? []).map((child) => buildSecurityElement(child, node.nodeId, `root|${node.nodeId}`)),
  }
}

function buildSecurityElement(node: InputNode, parentId: string, path: string): Record<string, unknown> {
  return {
    resource: node.nodeName,
    resourceId: node.nodeId,
    resourceType: node.nodeType,
    resourceParentId: parentId,
    resourcePath: path,
    SIFlag: siFlag('ATO'),
    objElements: (node.children ?? []).map((child) => buildSecurityElement(child, node.nodeId, `${path}|${node.nodeId}`)),
  }
}

// ---------------------------------------------------------------------------
// targetItems
// ---------------------------------------------------------------------------
function buildTargetItems(root: InputNode): unknown[] {
  return [
    {
      nodeId: root.nodeId,
      nodeName: '',
      nodeLabel: root.nodeLabel,
      nodeType: root.nodeType,
      parentId: 'root',
      path: 'root',
      elementInfo: elementInfoFor(root, 'group'),
      children: [],
    },
    ...(root.children ?? []).map((topLevel) => {
      const groupType: GroupType = topLevel.children ? topLevel.nodeGroupType : 'group'
      return {
        nodeId: topLevel.nodeId,
        nodeName: topLevel.nodeName,
        nodeLabel: topLevel.nodeLabel,
        nodeType: topLevel.nodeType,
        parentId: 'root',
        path: 'root',
        groupType,
        nodeVersion: 'v1',
        elementInfo: elementInfoFor(topLevel, groupType),
        children: buildTargetChildren(topLevel, `root|${topLevel.nodeId}`, groupType),
      }
    }),
  ]
}

/** Recurses -- the verified sample only showed one level of leaf children, but nothing about the shape assumes a leaf. */
function buildTargetChildren(node: InputNode, path: string, inheritedGroupType: GroupType): unknown[] {
  return (node.children ?? []).map((child) => {
    const groupType = resolveGroupType(child, inheritedGroupType)
    const entry: Record<string, unknown> = {
      nodeId: child.nodeId,
      nodeName: child.nodeName,
      nodeLabel: child.nodeLabel,
      nodeType: child.nodeType,
      path,
      parentId: node.nodeId,
      nodeVersion: 'v1',
      elementInfo: elementInfoFor(child, groupType),
    }
    if (child.children) entry.children = buildTargetChildren(child, `${path}|${child.nodeId}`, groupType)
    return entry
  })
}

// ---------------------------------------------------------------------------
// nodeTree echo (input tree + nodeAction added to every node)
// ---------------------------------------------------------------------------
function buildNodeTreeEcho(
  node: InputNode,
  parentId: string,
  inheritedGroupType: GroupType,
  nodeAction: string[],
): unknown {
  const isRoot = node.nodeId === 'root'
  const groupType = resolveGroupType(node, inheritedGroupType)

  const entry: Record<string, unknown> = {
    nodeId: node.nodeId,
    nodeType: node.nodeType,
    nodeLabel: node.nodeLabel,
    nodeName: node.nodeName,
  }
  if (!isRoot) entry.nodeParent = parentId
  entry.nodeGroupType = groupType
  entry.nodeAction = nodeAction
  entry.children = (node.children ?? []).map((child) =>
    buildNodeTreeEcho(child, node.nodeId, groupType, isRoot ? [child.nodeId] : [...nodeAction, child.nodeId]),
  )

  return entry
}
