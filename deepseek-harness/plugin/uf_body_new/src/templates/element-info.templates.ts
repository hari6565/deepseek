/**
 * Default `elementInfo` (the `props` / `events` / `validation` block) per
 * nodeType. The group/table/button/text/label/textinput/textarea/column
 * entries are copied verbatim from a verified real generated artifact.
 *
 * Every OTHER type is a GENERIC BEST-EFFORT fallback: `{ frameWork, version,
 * component, props: [], events: '#<nodeType>_events' }`. It follows the
 * verified shape's outer envelope but cannot invent that type's real prop
 * schema without a reference sample -- treat these as a starting point to
 * correct once real output for that control type is available, the same way
 * sample_corect.json let the original 8 be verified.
 *
 * Each factory returns a FRESH deep clone -- callers may safely mutate the
 * result (e.g. to inject a node's own label/name into a "content" or
 * "tableName" prop).
 */

import type { GroupType, InputNode, NodeType } from '../types.ts'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function pascalCase(nodeType: string): string {
  return nodeType.replace(/(^|_)([a-z])/g, (_m, _sep: string, c: string) => c.toUpperCase())
}

const HEADER_POSITION_SELECTION = ['left', 'top', 'right', 'bottom']

const ICON_SUBSELECTION = {
  iconDisplay: {
    name: 'iconDisplay',
    _type: 'select',
    selectionList: ['Icon only', 'Start with Icon', 'End with Icon'],
    value: 'End with Icon',
    enabled: true,
  },
}

// ---------------------------------------------------------------------------
// Verified templates (Canvas / group / table / button / text / label / textinput / textarea / column)
// ---------------------------------------------------------------------------
export function canvasElementInfo(): Record<string, unknown> {
  return {}
}

const GROUP_TEMPLATE = {
  props: [{ name: 'isDynamic', _type: 'boolean', value: false, enabled: true }],
  events: '#group_events',
}
export function groupElementInfo(): Record<string, unknown> {
  return clone(GROUP_TEMPLATE)
}

const TABLE_TEMPLATE = {
  frameWork: 'Nextjs',
  version: '14.2.3',
  component: 'Table',
  props: [
    { name: 'tableName', _type: 'text', value: '', enabled: true },
    { name: 'primaryKey', _type: 'text', value: 'id', enabled: true },
    { name: 'parentTableName', _type: 'text', value: '', enabled: true },
    { name: 'parentTablePrimaryKey', _label: 'Parent Table Column Name', _type: 'text', value: '', enabled: true },
    { name: 'tableSettings', _type: 'boolean', value: false, enabled: true },
    { name: 'tableSorting', _type: 'boolean', value: false, enabled: true },
    { name: 'tableSelection', _type: 'boolean', value: false, enabled: true },
    { name: 'search', _type: 'boolean', value: false, enabled: true },
    { name: 'tableActions', _type: 'boolean', value: false, enabled: true },
    { name: 'needLocking', _type: 'boolean', value: false, enabled: true },
    { name: 'isPivotTable', _type: 'boolean', value: false, enabled: true },
    {
      name: 'enableHeaderText', _type: 'conditionalBoolean', value: false, enabled: true,
      subSelection: {
        _true: {
          content: { name: 'Header Text', _type: 'text', value: '', enabled: true },
          position: { name: 'Header Position', _type: 'select', selectionList: HEADER_POSITION_SELECTION, value: 'top', enabled: true },
        },
      },
    },
  ],
  events: '#table_events',
}
export function tableElementInfo(): Record<string, unknown> {
  return clone(TABLE_TEMPLATE)
}

const BUTTON_TEMPLATE = {
  frameWork: 'Nextjs',
  version: '14.2.3',
  component: 'Button',
  props: [
    {
      name: 'view', _type: 'select',
      selectionList: [
        'normal', 'action', 'outlined', 'outlined-info', 'outlined-success', 'outlined-warning',
        'outlined-danger', 'outlined-utility', 'outlined-action', 'raised', 'flat', 'flat-secondary',
        'flat-info', 'flat-success', 'flat-warning', 'flat-danger', 'flat-utility', 'flat-action',
        'normal-contrast', 'outlined-contrast', 'flat-contrast',
      ],
      value: 'action', enabled: true,
    },
    { name: 'icon', _type: 'conditionalIconSearch', value: '', enabled: true, subSelection: clone(ICON_SUBSELECTION) },
    { name: 'disabled', _type: 'boolean', value: false, enabled: true },
    { name: 'isRecordLevel', _type: 'boolean', value: false, enabled: true },
    {
      name: 'pin', _type: 'select',
      selectionList: [
        'round-round', 'brick-brick', 'clear-clear', 'circle-circle', 'round-brick', 'brick-round',
        'round-clear', 'clear-round', 'brick-clear', 'clear-brick', 'circle-brick', 'brick-circle',
        'circle-clear', 'clear-circle',
      ],
      value: 'circle-circle', enabled: true,
    },
    {
      name: 'enableHeaderText', _type: 'conditionalBoolean', value: false, enabled: true,
      subSelection: {
        _true: {
          content: { name: 'Header Text', _type: 'text', value: '', enabled: true },
          position: { name: 'Header Position', _type: 'select', selectionList: HEADER_POSITION_SELECTION, value: 'top', enabled: true },
        },
      },
    },
    { name: 'isValidate', _type: 'boolean', value: true, enabled: true },
  ],
  events: '#button_events',
}
export function buttonElementInfo(): Record<string, unknown> {
  return clone(BUTTON_TEMPLATE)
}

const TEXT_TEMPLATE = {
  frameWork: 'Nextjs',
  version: '14.2.3',
  component: 'Text',
  props: [
    {
      name: 'static', _type: 'conditionalBoolean', value: true, enabled: true,
      subSelection: { _true: { content: { name: 'content', _type: 'text', value: '', enabled: true } } },
    },
    {
      name: 'variant', _type: 'select',
      selectionList: [
        'display-4', 'display-3', 'display-2', 'display-1', 'header-2', 'header-1', 'subheader-3',
        'subheader-2', 'subheader-1', 'body-3', 'body-2', 'body-1', 'body-short', 'caption-2',
        'caption-1', 'code-3', 'code-inline-3', 'code-2', 'code-inline-2', 'code-1', 'code-inline-1',
      ],
      value: 'display-3', enabled: true,
    },
    { name: 'wordBreak', _type: 'select', selectionList: ['break-all', 'break-word'], value: '', enabled: true },
    {
      name: 'color', _type: 'select',
      selectionList: [
        'primary', 'complementary', 'secondary', 'hint', 'info', 'info-heavy', 'positive',
        'positive-heavy', 'warning', 'warning-heavy', 'danger', 'danger-heavy', 'utility',
        'utility-heavy', 'misc', 'misc-heavy', 'brand', 'link', 'link-hover', 'link-visited',
        'link-visited-hover', 'dark-primary', 'dark-complementary', 'dark-secondary', 'light-primary',
        'light-complementary', 'light-secondary', 'light-hint', 'inverted-primary',
        'inverted-complementary', 'inverted-secondary', 'inverted-hint',
      ],
      value: 'primary', enabled: true,
    },
    {
      name: 'icon', _type: 'conditionalIconSearch', value: '', enabled: true,
      subSelection: {
        iconDisplay: { name: 'iconDisplay', _type: 'select', selectionList: ['Icon only', 'Start with Icon', 'End with Icon'], value: 'End with Icon', enabled: true },
        iconSize: { name: 'Icon Size', _type: 'number', value: 22, enabled: true },
      },
    },
  ],
  events: [] as string[],
}
export function textElementInfo(): Record<string, unknown> {
  return clone(TEXT_TEMPLATE)
}

const LABEL_TEMPLATE = {
  frameWork: 'Nextjs',
  version: '14.2.3',
  component: 'Label',
  label: '',
  props: [
    { name: 'theme', _type: 'select', selectionList: ['normal', 'info', 'danger', 'warning', 'success', 'utility', 'unknown', 'clear'], value: 'normal', enabled: true },
    { name: 'icon', _type: 'conditionalIconSearch', value: '', enabled: true, subSelection: clone(ICON_SUBSELECTION) },
    { name: 'interactive', _type: 'boolean', value: false, enabled: true },
    { name: 'copy', _type: 'string', value: '', enabled: true },
    { name: 'disabled', _type: 'boolean', value: false, enabled: true },
    { name: 'content', _type: 'string', value: '', enabled: true },
    {
      name: 'enableHeaderText', _type: 'conditionalBoolean', value: false, enabled: true,
      subSelection: {
        _true: {
          content: { name: 'Header Text', _type: 'string', value: '', enabled: true },
          position: { name: 'Header Position', _type: 'select', selectionList: HEADER_POSITION_SELECTION, value: '', enabled: true },
        },
      },
    },
  ],
  events: '#label_events',
}
export function labelElementInfo(): Record<string, unknown> {
  return clone(LABEL_TEMPLATE)
}

const TEXTINPUT_TEMPLATE = {
  frameWork: 'Nextjs',
  version: '14.2.3',
  component: 'TextInput',
  props: [
    { name: 'disabled', _label: 'Disabled', _type: 'boolean', value: false, enabled: true },
    { name: 'readOnly', _label: 'Read Only', _type: 'boolean', value: false, enabled: true },
    { name: 'pin', _label: 'Pin', _type: 'select', selectionList: ['round-round', 'brick-brick', 'clear-clear'], value: 'brick-brick', enabled: true },
    { name: 'view', _label: 'View', _type: 'select', selectionList: ['normal', 'clear'], value: 'normal', enabled: true },
    { name: 'placeholder', _label: 'Placeholder', _type: 'text', value: 'type here....', enabled: true },
    { name: 'leftContent', _label: 'Left Content', _type: 'text', value: '', enabled: true },
    { name: 'rightContent', _label: 'Right Content', _type: 'text', value: '', enabled: true },
    {
      name: 'enableHeaderText', _label: 'Enable Header Text', _type: 'conditionalBoolean', value: false, enabled: true,
      subSelection: {
        _true: {
          content: { name: 'Header Text', _type: 'text', value: '', enabled: true },
          position: { name: 'Header Position', _type: 'select', selectionList: HEADER_POSITION_SELECTION, value: 'top', enabled: true },
        },
      },
    },
    { name: 'numberFormat', _label: 'Number Format Style', _type: 'select', selectionList: ['none', 'Indian', 'International', 'European'], value: '', enabled: false },
    { name: 'isCurrency', _label: 'Is Currency', _type: 'boolean', value: false, enabled: true },
    { name: 'bindInitialData', _label: 'Bind Initial Data', _type: 'boolean', value: false, enabled: true },
  ],
  events: '#textinput_events',
  validation: '#textinput_validation',
}
export function textinputElementInfo(): Record<string, unknown> {
  return clone(TEXTINPUT_TEMPLATE)
}

const TEXTAREA_TEMPLATE = {
  frameWork: 'Nextjs',
  version: '14.2.3',
  component: 'TextArea',
  props: [
    { name: 'disabled', _type: 'boolean', value: false, enabled: true },
    { name: 'readOnly', _type: 'boolean', value: false, enabled: true },
    {
      name: 'pin', _type: 'select',
      selectionList: ['round-round', 'brick-brick', 'clear-clear', 'round-brick', 'brick-round', 'round-clear', 'clear-round', 'brick-clear', 'clear-brick'],
      value: 'brick-brick', enabled: true,
    },
    { name: 'placeholder', _type: 'text', value: 'type here...', enabled: true },
    {
      name: 'enableHeaderText', _type: 'conditionalBoolean', value: false, enabled: true,
      subSelection: {
        _true: {
          content: { name: 'Header Text', _type: 'text', value: '', enabled: true },
          position: { name: 'Header Position', _type: 'select', selectionList: HEADER_POSITION_SELECTION, value: 'top', enabled: true },
        },
      },
    },
  ],
  events: '#textarea_events',
  validation: '#textarea_validation',
}
export function textareaElementInfo(): Record<string, unknown> {
  return clone(TEXTAREA_TEMPLATE)
}

const COLUMN_TEMPLATE = {
  frameWork: 'Nextjs',
  version: '14.2.3',
  component: 'column',
  props: [
    { name: 'hide', _type: 'boolean', value: false, enabled: true },
    { name: 'needSearch', _type: 'boolean', value: false, enabled: true },
    { name: 'isSummable', _type: 'boolean', value: false, enabled: true },
    {
      name: 'ShowAsColorIndicator', _type: 'conditionalBoolean', value: false, enabled: true,
      subSelection: {
        _true: {
          colorIndicatorViewType: { name: 'colorIndicatorViewType', _type: 'select', selectionList: ['rectangle', 'rounded'], value: '', enabled: true },
          keyValue: {
            name: 'keyValue', _label: 'keyValue', _type: 'array',
            items: [{
              key: { name: 'key', _label: 'Value', _type: 'text', value: '', enabled: true },
              colorCode: { name: 'colorCode', _label: 'Color For Value', _type: 'color', value: '', enabled: true },
              icon: { name: 'icon', _label: 'Icon', _type: 'iconsearch', value: '', enabled: true },
            }],
          },
        },
      },
    },
  ],
  events: [] as string[],
}
export function columnElementInfo(): Record<string, unknown> {
  return clone(COLUMN_TEMPLATE)
}

/** A label's displayed "content" strips a trailing "label" and capitalizes -- see uf_body's builders/element-info fix. */
function humanizeLabelContent(text: string): string {
  const stripped = text.replace(/label$/i, '') || text
  return stripped.charAt(0).toUpperCase() + stripped.slice(1)
}

// ---------------------------------------------------------------------------
// Generic fallback (unverified) for every type outside the verified set
// ---------------------------------------------------------------------------
function genericElementInfo(nodeType: NodeType): Record<string, unknown> {
  return {
    frameWork: 'Nextjs',
    version: '14.2.3',
    component: pascalCase(nodeType),
    props: [],
    events: `#${nodeType}_events`,
  }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
export function elementInfoFor(node: InputNode, groupType: GroupType): Record<string, unknown> {
  switch (node.nodeType) {
    case 'Canvas':
    case 'tab_group':
    case 'tab_header':
      return canvasElementInfo()
    case 'group': {
      if (groupType === 'table') {
        const info = tableElementInfo()
        const props = info.props as Array<{ name: string, value?: unknown }>
        const tableName = props.find((p) => p.name === 'tableName')
        if (tableName) tableName.value = node.nodeName
        return info
      }
      return groupElementInfo()
    }
    case 'button':
      return buttonElementInfo()
    case 'text': {
      const info = textElementInfo()
      const props = info.props as Array<{ name: string, subSelection?: { _true?: { content?: { value?: unknown } } } }>
      const staticProp = props.find((p) => p.name === 'static')
      if (staticProp?.subSelection?._true?.content) {
        staticProp.subSelection._true.content.value = node.nodeLabel
      }
      return info
    }
    case 'label': {
      const info = labelElementInfo()
      const props = info.props as Array<{ name: string, value?: unknown }>
      const contentProp = props.find((p) => p.name === 'content')
      if (contentProp) contentProp.value = humanizeLabelContent(node.nodeLabel)
      return info
    }
    case 'textinput':
      return textinputElementInfo()
    case 'textarea':
      return textareaElementInfo()
    case 'column':
      return columnElementInfo()
    default:
      return genericElementInfo(node.nodeType)
  }
}
