/**
 * `elementInfo` (the `props` / `events` / `validation` block) per node.
 *
 * The data for every node kind lives in catalog-element-info.ts -- that is the one place to add or
 * correct a component. This file only turns an entry into an `elementInfo` object and injects the
 * few values that come from the node itself:
 *   - label:  `content` prop  <- the node's label (humanized)
 *   - text:   `static` content <- the node's label
 *   - table:  `tableName` prop <- the node's name
 *
 * Canvas carries no elementInfo (`{}`). A nodeType missing from the catalog falls back to the empty
 * `{ frameWork, version, component, props: [], events }` placeholder.
 *
 * Each call returns a FRESH deep clone -- callers may safely mutate the result.
 */

import type { GroupType, InputNode, NodeType } from '../types.ts'
import { CATALOG_ELEMENT_INFO } from './catalog-element-info.ts'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function pascalCase(nodeType: string): string {
  return nodeType.replace(/(^|_)([a-z])/g, (_m, _sep: string, c: string) => c.toUpperCase())
}

/** A label's displayed "content" strips a trailing "label" and capitalizes -- see uf_body's builders/element-info fix. */
function humanizeLabelContent(text: string): string {
  const stripped = text.replace(/label$/i, '') || text
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

export function canvasElementInfo(): Record<string, unknown> {
  return {}
}

/**
 * Builds an elementInfo from a catalog entry. Kinds with no component (group, subscreen,
 * artifactgroup, grouparray) get the bare `{ props, events }` shape; the rest carry
 * `{ frameWork, version, component, [label], props, events, [validation] }`. A kind with no
 * events (e.g. avatar, text, column) gets `events: []`.
 */
function catalogElementInfo(key: string): Record<string, unknown> | undefined {
  const entry = CATALOG_ELEMENT_INFO[key]
  if (!entry) return undefined
  const info: Record<string, unknown> = entry.component
    ? { frameWork: 'Nextjs', version: '14.2.3', component: entry.component }
    : {}
  if (entry.label !== undefined) info.label = entry.label
  info.props = clone(entry.props)
  info.events = entry.hasEvents ? `#${key}_events` : ([] as string[])
  if (entry.hasValidation) info.validation = `#${key}_validation`
  return info
}

function genericElementInfo(nodeType: NodeType): Record<string, unknown> {
  return {
    frameWork: 'Nextjs',
    version: '14.2.3',
    component: pascalCase(nodeType),
    props: [],
    events: `#${nodeType}_events`,
  }
}

export function elementInfoFor(node: InputNode, groupType: GroupType): Record<string, unknown> {
  if (node.nodeType === 'Canvas') return canvasElementInfo()

  // A "group" node's kind is its nodeGroupType (table, dynamicactions, ...); every other node's is its nodeType.
  const key = node.nodeType === 'group' ? groupType : node.nodeType
  const info = catalogElementInfo(key) ?? genericElementInfo(node.nodeType)
  const props = info.props as Array<{ name: string, value?: unknown, subSelection?: { _true?: { content?: { value?: unknown } } } }>

  if (node.nodeType === 'group' && groupType === 'table') {
    const tableName = props.find((p) => p.name === 'tableName')
    if (tableName) tableName.value = node.nodeName
  } else if (node.nodeType === 'text') {
    const staticProp = props.find((p) => p.name === 'static')
    if (staticProp?.subSelection?._true?.content) staticProp.subSelection._true.content.value = node.nodeLabel
  } else if (node.nodeType === 'label') {
    const contentProp = props.find((p) => p.name === 'content')
    if (contentProp) contentProp.value = humanizeLabelContent(node.nodeLabel)
  }
  return info
}
