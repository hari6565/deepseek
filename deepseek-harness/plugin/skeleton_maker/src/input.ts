// Parses + validates skeleton_maker's input: the JSON result of the humantoai tool.
//
//   { type:"root", name:"root", children: {
//       <groupkey>: { type:"group", name, [nodeGroupType], children:["Field_name as a <type> type", ...] } } }
//
// (Same contract as plugin/humantoai/src/catalog.ts; duplicated on purpose so this
// plugin stays standalone and the other plugins are untouched.)

/** The 46 controls the harness actually has. */
export const NODE_TYPES = [
  'textinput', 'textarea', 'richtexteditor', 'pininput', 'combobox', 'dropdown', 'label', 'text',
  'datepicker', 'timepicker', 'dateandtime', 'checkbox', 'switch', 'radio', 'radiogroup', 'radiobutton',
  'slider', 'button', 'documentuploader', 'documentuploadpanel', 'documentviewer', 'image', 'signature',
  'qrcode', 'avatar', 'icon', 'column', 'list', 'card', 'pivottable', 'timeline', 'treeviewer',
  'progress', 'progressbar', 'divider', 'jsonviewer', 'jsoneditor', 'xmlviewer', 'dynamicjsonform',
  'advancesearch', 'piechart', 'barchart', 'linechart', 'text_to_speech', 'speech_to_text', 'customwidget',
] as const

const NODE_TYPE_SET: ReadonlySet<string> = new Set(NODE_TYPES)

/** Group kinds and the only control each may hold. */
export const GROUP_KINDS: Record<string, { only?: string }> = {
  table: { only: 'column' },
  dynamicactions: { only: 'button' },
  grouparray: {},
}

export interface Item {
  /** Field name as written, underscores kept: "Date_of_birth". */
  name: string
  type: string
}

export interface Group {
  /** Lowercase alphanumeric key/name: "formgroup". */
  name: string
  /** undefined = ordinary group. */
  kind?: 'table' | 'dynamicactions' | 'grouparray'
  items: Item[]
}

export interface ParsedScreen {
  groups: Group[]
}

type Json = Record<string, unknown>
const isObj = (v: unknown): v is Json => typeof v === 'object' && v !== null && !Array.isArray(v)

const CHILD_RE = /^\s*(.+?)\s+as\s+(?:a|an)\s+(.+?)\s+type\s*$/i
const show = (v: unknown): string => {
  const t = JSON.stringify(v)
  return t.length > 60 ? `${t.slice(0, 57)}...` : t
}

/**
 * Accept the humantoai result as an object or a JSON string (models often pass
 * either), and parse it. Throws ONE error listing every problem so the caller
 * (the model driving the tools) can fix its argument in a single retry.
 */
export function parseInput(input: unknown): ParsedScreen {
  let raw = input
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause)
      throw new Error(`skeleton_maker: "screen" was a string but not valid JSON (${message}). Pass the humantoai_generate result as-is.`)
    }
  }

  const errors: string[] = []
  const fail = (): never => {
    throw new Error(`skeleton_maker: the input is not a valid humantoai result:\n- ${errors.slice(0, 20).join('\n- ')}`)
  }

  if (!isObj(raw) || !(isObj(raw.children) || Array.isArray(raw.children))) {
    errors.push('expected {"type":"root","name":"root","children":{ <groupkey>: {group}, ... }}.')
    return fail()
  }
  const entries: Array<[string, unknown]> = Array.isArray(raw.children)
    ? raw.children.map((g, i) => [isObj(g) && typeof g.name === 'string' ? g.name : `group${String(i + 1)}`, g])
    : Object.entries(raw.children)
  if (entries.length === 0) {
    errors.push('root.children is empty; there must be at least one group.')
    return fail()
  }

  const groups: Group[] = []
  const seen = new Set<string>()
  for (const [rawKey, rawGroup] of entries) {
    const where = `group "${rawKey}"`
    const key = rawKey.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (!key) {
      errors.push(`${where}: key has no usable letters or digits.`)
      continue
    }
    if (seen.has(key)) {
      errors.push(`${where}: duplicate group key "${key}".`)
      continue
    }
    seen.add(key)
    if (!isObj(rawGroup) || rawGroup.type !== 'group') {
      errors.push(`${where}: must be an object with "type":"group".`)
      continue
    }
    let kind: Group['kind']
    if (rawGroup.nodeGroupType !== undefined) {
      if (typeof rawGroup.nodeGroupType !== 'string' || !(rawGroup.nodeGroupType in GROUP_KINDS)) {
        errors.push(`${where}: nodeGroupType must be one of [${Object.keys(GROUP_KINDS).join(', ')}] or omitted, got ${show(rawGroup.nodeGroupType)}.`)
        continue
      }
      kind = rawGroup.nodeGroupType as Group['kind']
    }
    if (!Array.isArray(rawGroup.children) || rawGroup.children.length === 0) {
      errors.push(`${where}: "children" must be a non-empty array of "Name as a <type> type" strings.`)
      continue
    }

    const items: Item[] = []
    rawGroup.children.forEach((child: unknown, i) => {
      const at = `${where} children[${String(i)}]`
      const text = isObj(child) && typeof child.name === 'string' && typeof child.type === 'string'
        ? `${child.name} as a ${child.type} type`
        : child
      const m = typeof text === 'string' ? CHILD_RE.exec(text) : null
      if (!m) {
        errors.push(`${at}: must be exactly "Name as a <type> type", got ${show(child)}.`)
        return
      }
      const name = m[1].trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '')
      const type = m[2].trim().toLowerCase()
      if (!name) {
        errors.push(`${at}: name is empty.`)
        return
      }
      if (!NODE_TYPE_SET.has(type)) {
        errors.push(`${at} ("${name}"): "${type}" is not one of the 46 allowed control types.`)
        return
      }
      items.push({ name, type })
    })

    if (!kind && items.length > 0 && items.every(it => it.type === 'column')) kind = 'table'
    if (kind) {
      const only = GROUP_KINDS[kind].only
      if (only && items.some(it => it.type !== only)) errors.push(`${where}: a "${kind}" group may contain ONLY ${only} controls.`)
    }
    if (kind !== 'table' && items.some(it => it.type === 'column')) {
      errors.push(`${where}: "column" controls are only allowed inside a table group.`)
    }
    groups.push({ name: key, kind, items })
  }

  if (errors.length > 0) return fail()
  return { groups }
}
