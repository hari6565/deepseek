/**
 * Default `nodeAppearance` (icon/color/handles) and `version` string per
 * nodeType. The group/table/button/text/label/textinput/textarea/column
 * entries are copied verbatim from a verified real generated artifact (see
 * uf_body's own templates, cross-checked against sample_corect.json).
 *
 * Every OTHER type here is a GENERIC BEST-EFFORT fallback, not verified
 * against real output -- there is no reference sample covering the expanded
 * ui-skeleton-spec.md catalog yet. The icon path follows the one
 * near-uniform convention observed across every verified type
 * (`${ICON_BASE}/${nodeType}.svg`, with "textinput" -> "text_input.svg" the
 * only known exception); `version` is intentionally omitted for unverified
 * types rather than guessing a "TRL:..." string with no evidence behind it.
 */
import type { GroupType, NodeType } from '../types.ts'

const ICON_BASE = '/torus/9.1/resources/nodeicons/UF-UFW'

const CONNECTABLE_HANDLES = [
  { type: 'source', position: 'right', isConnectable: true, shown: true },
  { type: 'target', position: 'left', isConnectable: true, shown: true },
]

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

// --- Verified (from uf_body / sample_corect.json) --------------------------

export function groupAppearance(groupType: GroupType): Record<string, unknown> {
  if (groupType === 'table') {
    return {
      type: 'table',
      label: 'table',
      color: '#0736C4',
      shape: 'square',
      icon: `${ICON_BASE}/table.svg`,
      size: 45,
      handles: clone(CONNECTABLE_HANDLES),
    }
  }
  return {
    type: 'group',
    label: 'group',
    color: '#F44336',
    shape: 'square',
    icon: `${ICON_BASE}/group.svg`,
    size: 45,
    handles: clone(CONNECTABLE_HANDLES),
  }
}

export function buttonAppearance(): Record<string, unknown> {
  return { icon: `${ICON_BASE}/button.svg`, color: '#0736C4', label: 'button', size: 45 }
}

export function textAppearance(): Record<string, unknown> {
  return { label: 'text', color: '#0736C4', icon: `${ICON_BASE}/text.svg` }
}

export function labelAppearance(): Record<string, unknown> {
  return { label: 'label', color: '#0736C4', icon: `${ICON_BASE}/label.svg`, size: 45 }
}

export function textinputAppearance(): Record<string, unknown> {
  return {
    type: 'textinput',
    label: 'textinput',
    color: '#0736C4',
    shape: 'square',
    icon: `${ICON_BASE}/text_input.svg`,
    size: 45,
    handles: clone(CONNECTABLE_HANDLES),
  }
}

export function textareaAppearance(): Record<string, unknown> {
  return { label: 'textarea', icon: `${ICON_BASE}/textarea.svg`, color: '#0736C4' }
}

export function columnAppearance(): Record<string, unknown> {
  return {
    type: 'column',
    label: 'column',
    color: '#F44336',
    shape: 'square',
    icon: `${ICON_BASE}/column.svg`,
    size: 45,
    handles: clone(CONNECTABLE_HANDLES),
  }
}

const VERSION_TAG: Partial<Record<Exclude<NodeType, 'Canvas'>, string>> = {
  group: 'TRL:AFR:UF-UFW:Next:Defaults:group:v1',
  button: 'TRL:AFR:UF-UFW:Next:Inputs:button:v1',
  text: 'TRL:AFR:UF-UFW:Next:DataDisplay:text:v1',
  label: 'TRL:AFR:UF-UFW:Next:DataDisplay:label:v1',
  textinput: 'TRL:AFR:UF-UFW:Next:Inputs:textinput:v1',
  textarea: 'TRL:AFR:UF-UFW:Next:Inputs:textarea:v1',
  column: 'TRL:AFR:UF-UFW:Next:Defaults:column:v1',
}

// --- Generic fallback (unverified) ------------------------------------------

function genericAppearance(nodeType: NodeType): Record<string, unknown> {
  return { label: nodeType, color: '#0736C4', icon: `${ICON_BASE}/${nodeType}.svg`, size: 45 }
}

/** `data.nodeAppearance` for a node, or `undefined` for Canvas which carries none. */
export function appearanceFor(nodeType: NodeType, groupType: GroupType): Record<string, unknown> | undefined {
  switch (nodeType) {
    case 'Canvas':
    case 'tab_group':
    case 'tab_header':
      return undefined
    case 'group':
      return groupAppearance(groupType)
    case 'button':
      return buttonAppearance()
    case 'text':
      return textAppearance()
    case 'label':
      return labelAppearance()
    case 'textinput':
      return textinputAppearance()
    case 'textarea':
      return textareaAppearance()
    case 'column':
      return columnAppearance()
    default:
      return genericAppearance(nodeType)
  }
}

/** `version` string for a node, or `undefined` for Canvas/tab containers/unverified types. */
export function versionTagFor(nodeType: NodeType, groupType: GroupType): string | undefined {
  if (nodeType === 'Canvas' || nodeType === 'tab_group' || nodeType === 'tab_header') return undefined
  if (nodeType === 'group' && groupType === 'table') {
    return 'TRL:AFR:UF-UFW:Next:Defaults:table:v1'
  }
  return VERSION_TAG[nodeType as Exclude<NodeType, 'Canvas'>]
}
