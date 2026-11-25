// The component catalog + output-format rules for humantoai, taken from
// D:\deepseekgitcode\newtoolprompt.txt, plus the validator/normalizer that
// enforces them on whatever the model returns.
//
// Output format (one screen):
//   { type: "root", name: "root", children: {
//       <groupkey>: { type: "group", name: <groupkey>, [nodeGroupType], children: ["Field_name as a <type> type", ...] }
//   } }

/** The 46 controls the harness actually has. Nothing else may appear as a child. */
export const NODE_TYPES = [
  'textinput', 'textarea', 'richtexteditor', 'pininput', 'combobox', 'dropdown', 'label', 'text',
  'datepicker', 'timepicker', 'dateandtime', 'checkbox', 'switch', 'radio', 'radiogroup', 'radiobutton',
  'slider', 'button', 'documentuploader', 'documentuploadpanel', 'documentviewer', 'image', 'signature',
  'qrcode', 'avatar', 'icon', 'column', 'list', 'card', 'pivottable', 'timeline', 'treeviewer',
  'progress', 'progressbar', 'divider', 'jsonviewer', 'jsoneditor', 'xmlviewer', 'dynamicjsonform',
  'advancesearch', 'piechart', 'barchart', 'linechart', 'text_to_speech', 'speech_to_text', 'customwidget',
] as const

const NODE_TYPE_SET: ReadonlySet<string> = new Set(NODE_TYPES)

/**
 * Container kinds a "group" can be, and which controls they may hold.
 * (A table is a group whose children are ONLY columns; an action bar is a group
 * whose children are ONLY buttons.) Omit nodeGroupType for an ordinary group.
 */
export const GROUP_KINDS: Record<string, { only?: string }> = {
  table: { only: 'column' },
  dynamicactions: { only: 'button' },
  grouparray: {},
}

export interface GroupNode {
  type: 'group'
  name: string
  nodeGroupType?: string
  children: string[]
}

export interface Screen {
  type: 'root'
  name: 'root'
  children: Record<string, GroupNode>
}

export interface Result {
  screen?: Screen
  errors: string[]
  warnings: string[]
  /** Silent fixes applied (spacing in names, key/name mismatches, ...). */
  repairs: string[]
}

type Json = Record<string, unknown>
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)

const CHILD_RE = /^\s*(.+?)\s+as\s+(?:a|an)\s+(.+?)\s+type\s*$/i
const show = (v: unknown): string => {
  const t = JSON.stringify(v)
  return t.length > 60 ? `${t.slice(0, 57)}...` : t
}

/** "Phone number" -> "Phone_number"; strips anything that isn't a word character. */
function cleanName(raw: string): string {
  return raw.trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '')
}

/** Validate (and lightly repair) the model's object, returning the canonical Screen when error-free. */
export function normalizeScreen(raw: unknown): Result {
  const out: Result = { errors: [], warnings: [], repairs: [] }

  if (!isObj(raw) || (!isObj(raw.children) && !Array.isArray(raw.children))) {
    out.errors.push('the result must be an object {"type":"root","name":"root","children":{ <groupkey>: {group}, ... }}.')
    return out
  }
  if (raw.type !== 'root' || raw.name !== 'root') out.repairs.push('set root type/name to "root".')

  // children may arrive as an array of groups; key them by their name.
  let groupEntries: Array<[string, unknown]>
  if (Array.isArray(raw.children)) {
    out.repairs.push('converted a children array of groups into an object keyed by group name.')
    groupEntries = raw.children.map((g, i) => [isObj(g) && typeof g.name === 'string' ? g.name : `group${String(i + 1)}`, g])
  } else {
    groupEntries = Object.entries(raw.children)
  }
  if (groupEntries.length === 0) {
    out.errors.push('root.children is empty; there must be at least one group.')
    return out
  }

  const children: Record<string, GroupNode> = {}
  for (const [rawKey, rawGroup] of groupEntries) {
    const where = `group "${rawKey}"`
    const key = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!key) {
      out.errors.push(`${where}: key has no usable letters or digits.`)
      continue
    }
    if (key !== rawKey) out.repairs.push(`${where}: key normalized to "${key}".`)
    if (key in children) {
      out.errors.push(`${where}: duplicate group key "${key}".`)
      continue
    }
    if (!isObj(rawGroup)) {
      out.errors.push(`${where}: must be an object {"type":"group","name",...,"children":[...]}.`)
      continue
    }
    if (rawGroup.type !== 'group') {
      out.errors.push(`${where}: "type" must be "group" (got ${show(rawGroup.type)}); controls go inside "children" as strings, not as groups.`)
      continue
    }
    if (rawGroup.name !== key) out.repairs.push(`${where}: set name to match the key "${key}".`)

    let groupKind: string | undefined
    if (rawGroup.nodeGroupType !== undefined) {
      if (typeof rawGroup.nodeGroupType !== 'string' || !(rawGroup.nodeGroupType in GROUP_KINDS)) {
        out.errors.push(`${where}: nodeGroupType must be one of [${Object.keys(GROUP_KINDS).join(', ')}] or omitted, got ${show(rawGroup.nodeGroupType)}.`)
        continue
      }
      groupKind = rawGroup.nodeGroupType
    }

    if (!Array.isArray(rawGroup.children) || rawGroup.children.length === 0) {
      out.errors.push(`${where}: "children" must be a non-empty array of "Name as a <type> type" strings.`)
      continue
    }

    const lines: string[] = []
    const types: string[] = []
    const seenNames = new Set<string>()
    rawGroup.children.forEach((child: unknown, i) => {
      const at = `${where} children[${String(i)}]`
      let text = child
      if (isObj(child) && typeof child.name === 'string' && typeof child.type === 'string') {
        text = `${child.name} as a ${child.type} type`
        out.repairs.push(`${at}: converted an object into the "Name as a <type> type" string.`)
      }
      const m = typeof text === 'string' ? CHILD_RE.exec(text) : null
      if (!m) {
        out.errors.push(`${at}: must be exactly "Name as a <type> type", got ${show(child)}.`)
        return
      }
      const name = cleanName(m[1])
      const type = m[2].trim().toLowerCase()
      if (!name) {
        out.errors.push(`${at}: name is empty.`)
        return
      }
      if (type === 'group') {
        out.errors.push(`${at}: "group" is a container, not a control; put its controls in a separate group instead.`)
        return
      }
      if (!NODE_TYPE_SET.has(type)) {
        out.errors.push(`${at} ("${name}"): "${type}" is not one of the 46 allowed control types. Pick ONE type from the list (never "A or B").`)
        return
      }
      if (seenNames.has(name.toLowerCase())) out.errors.push(`${at}: duplicate name "${name}" in this group.`)
      seenNames.add(name.toLowerCase())
      if (text !== `${name} as a ${type} type`) out.repairs.push(`${at}: normalized to "${name} as a ${type} type".`)
      lines.push(`${name} as a ${type} type`)
      types.push(type)
    })

    // Container rules.
    if (!groupKind && types.length > 0 && types.every(t => t === 'column')) {
      groupKind = 'table'
      out.repairs.push(`${where}: all children are columns, so nodeGroupType was set to "table".`)
    }
    if (groupKind) {
      const only = GROUP_KINDS[groupKind].only
      if (only && types.some(t => t !== only)) {
        out.errors.push(`${where}: a "${groupKind}" group may contain ONLY ${only} controls.`)
      }
    }
    if (groupKind !== 'table' && types.includes('column')) {
      out.errors.push(`${where}: "column" controls are only allowed inside a group with nodeGroupType "table".`)
    }

    const node: GroupNode = { type: 'group', name: key, children: lines }
    if (groupKind) node.nodeGroupType = groupKind
    // Canonical key order: type, name, nodeGroupType, children.
    children[key] = {
      type: node.type,
      name: node.name,
      ...(node.nodeGroupType ? { nodeGroupType: node.nodeGroupType } : {}),
      children: node.children,
    }
  }

  if (out.errors.length === 0) out.screen = { type: 'root', name: 'root', children }
  return out
}
