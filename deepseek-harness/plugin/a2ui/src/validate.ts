// Validator + light auto-repair for the A2UI JSON this harness targets
// (sample: D:\deepseekgitcode\a2uimodel.json):
//
//   [ { "version": "1.0",
//       "createSurface": { "surfaceId", "catalogId", "components": [ ...flat list... ] } } ]
//
// Components are FLAT: { "id", "component": "<Type>", ...props inline }, and
// containers reference children by id. The component catalog below was INFERRED
// from that sample -- it is ONE table, so adding a component the real catalog
// has (Row, Button, LineChart, ...) is a data change, not a logic change.

export type JsonObject = Record<string, unknown>

export const isObj = (v: unknown): v is JsonObject => typeof v === 'object' && v !== null && !Array.isArray(v)

type Kind = 'string' | 'number' | 'boolean' | 'stringOrNumber' | 'ids' | 'enum' | 'items'

interface PropSpec {
  kind: Kind
  required?: boolean
  values?: readonly string[]
  /** For kind "items": the per-element property table (omit to accept any objects). */
  item?: Record<string, PropSpec>
}

const str = (required = false): PropSpec => ({ kind: 'string', required })
const num = (required = false): PropSpec => ({ kind: 'number', required })
const strOrNum = (required = false): PropSpec => ({ kind: 'stringOrNumber', required })
const bool = (): PropSpec => ({ kind: 'boolean' })
const ids = (required = true): PropSpec => ({ kind: 'ids', required })
const oneOf = (...values: string[]): PropSpec => ({ kind: 'enum', values })
const items = (item?: Record<string, PropSpec>, required = false): PropSpec => ({ kind: 'items', required, item })

export const CATALOG: Record<string, Record<string, PropSpec>> = {
  Column: { children: ids(), gap: num() },
  Grid: { children: ids(), columns: strOrNum(), gap: num() },
  Section: { children: ids(), title: str(), eyebrow: str(), description: str() },
  Heading: { text: str(true), eyebrow: str(), subtitle: str() },
  Caption: { text: str(true), color: str(), size: str() },
  Markdown: { text: str(true) },
  Callout: { text: str(true), title: str() },
  Stat: {
    label: str(true),
    value: strOrNum(true),
    delta: str(),
    trend: oneOf('up', 'down', 'flat'),
    caption: str(),
    tone: str(),
  },
  BarChart: {
    title: str(),
    subtitle: str(),
    height: num(),
    format: str(),
    unit: str(),
    data: items({ x: strOrNum(true), y: num(true), series: str() }, true),
  },
  PieChart: {
    title: str(),
    subtitle: str(),
    height: num(),
    format: str(),
    unit: str(),
    donut: bool(),
    centerLabel: str(),
    data: items({ label: str(true), value: num(true) }, true),
  },
  DataTable: {
    title: str(),
    columns: items({ key: str(true), label: str(true), format: str() }, true),
    rows: items(undefined, true),
  },
}

export interface SurfaceSummary {
  surfaceId: string
  catalogId: string
  componentCount: number
}

export interface Report {
  errors: string[]
  warnings: string[]
  /** Silent fixes applied in place (e.g. "5" -> 5). */
  repairs: string[]
  surfaces: SurfaceSummary[]
}

interface Ctx {
  errors: string[]
  warnings: string[]
  repairs: string[]
}

const show = (v: unknown): string => {
  const text = JSON.stringify(v)
  return text.length > 60 ? `${text.slice(0, 57)}...` : text
}

/** Coerce the unambiguous slips weak models make; returns the (possibly new) value. */
function coerce(spec: PropSpec, value: unknown, where: string, ctx: Ctx): unknown {
  if (spec.kind === 'number' && typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) {
    ctx.repairs.push(`${where}: converted string ${show(value)} to a number.`)
    return Number(value)
  }
  if (spec.kind === 'string' && (typeof value === 'number' || typeof value === 'boolean')) {
    ctx.repairs.push(`${where}: converted ${show(value)} to a string.`)
    return String(value)
  }
  if (spec.kind === 'boolean' && (value === 'true' || value === 'false')) {
    ctx.repairs.push(`${where}: converted string ${show(value)} to a boolean.`)
    return value === 'true'
  }
  return value
}

function checkValue(spec: PropSpec, value: unknown, where: string, ctx: Ctx, refs: string[]): void {
  switch (spec.kind) {
    case 'string':
      if (typeof value !== 'string') ctx.errors.push(`${where}: must be a string, got ${show(value)}.`)
      break
    case 'number':
      if (typeof value !== 'number' || !Number.isFinite(value)) ctx.errors.push(`${where}: must be a number, got ${show(value)}.`)
      break
    case 'boolean':
      if (typeof value !== 'boolean') ctx.errors.push(`${where}: must be true or false, got ${show(value)}.`)
      break
    case 'stringOrNumber':
      if (typeof value !== 'string' && typeof value !== 'number') ctx.errors.push(`${where}: must be a string or number, got ${show(value)}.`)
      break
    case 'enum':
      if (typeof value !== 'string' || !(spec.values ?? []).includes(value)) {
        ctx.errors.push(`${where}: must be one of [${(spec.values ?? []).join(', ')}], got ${show(value)}.`)
      }
      break
    case 'ids':
      if (!Array.isArray(value)) {
        ctx.errors.push(`${where}: must be an array of component id strings (children are referenced BY ID, never nested inline).`)
        break
      }
      value.forEach((id: unknown, i) => {
        if (typeof id !== 'string' || id.length === 0) {
          ctx.errors.push(`${where}[${String(i)}]: must be a component id string, got ${show(id)}.`)
        } else {
          refs.push(id)
        }
      })
      break
    case 'items':
      if (!Array.isArray(value) || value.length === 0) {
        ctx.errors.push(`${where}: must be a non-empty array of objects.`)
        break
      }
      value.forEach((entry: unknown, i) => {
        const at = `${where}[${String(i)}]`
        if (!isObj(entry)) {
          ctx.errors.push(`${at}: must be an object, got ${show(entry)}.`)
          return
        }
        if (spec.item) processProps(spec.item, entry, at, ctx, refs, [])
      })
      break
  }
}

function processProps(
  table: Record<string, PropSpec>,
  props: JsonObject,
  where: string,
  ctx: Ctx,
  refs: string[],
  ignore: string[],
): void {
  for (const [name, spec] of Object.entries(table)) {
    if (props[name] === undefined) {
      if (spec.required) ctx.errors.push(`${where}: missing required property "${name}".`)
      continue
    }
    props[name] = coerce(spec, props[name], `${where}.${name}`, ctx)
    checkValue(spec, props[name], `${where}.${name}`, ctx, refs)
  }
  for (const key of Object.keys(props)) {
    if (!(key in table) && !ignore.includes(key)) ctx.warnings.push(`${where}: unknown property "${key}".`)
  }
}

interface ParsedComponent {
  id: string
  type: string
  refs: string[]
}

function validateComponent(raw: unknown, where: string, ctx: Ctx): ParsedComponent | undefined {
  if (!isObj(raw)) {
    ctx.errors.push(`${where}: must be an object {"id","component",...props}.`)
    return undefined
  }
  if (typeof raw.id !== 'string' || raw.id.length === 0) {
    ctx.errors.push(`${where}: missing string "id".`)
    return undefined
  }
  const at = `${where}(id=${raw.id})`
  if (typeof raw.component !== 'string') {
    ctx.errors.push(`${at}: "component" must be the component type NAME as a string (e.g. "Column"), props go beside it, not inside it.`)
    return undefined
  }
  const type = raw.component
  const table = (CATALOG as Record<string, Record<string, PropSpec> | undefined>)[type]
  if (!table) {
    ctx.errors.push(`${at}: unknown component type "${type}". Allowed: ${Object.keys(CATALOG).join(', ')}.`)
    return undefined
  }
  const refs: string[] = []
  processProps(table, raw, `${at}.${type}`, ctx, refs, ['id', 'component'])
  return { id: raw.id, type, refs }
}

export interface CanonicalizeOptions {
  surfaceId: string
  catalogId: string
}

/**
 * Pin the envelope fields the harness owns (version, surfaceId, catalogId) and
 * their key order, so they're correct regardless of what the model wrote.
 * Leaves anything that isn't a single createSurface message for validation to report.
 */
export function canonicalize(messages: unknown[], options: CanonicalizeOptions): unknown[] {
  if (messages.length !== 1 || !isObj(messages[0]) || !isObj(messages[0].createSurface)) return messages
  const { components } = messages[0].createSurface
  return [{
    version: '1.0',
    createSurface: { surfaceId: options.surfaceId, catalogId: options.catalogId, components },
  }]
}

export function validateMessages(messages: unknown[]): Report {
  const ctx: Ctx = { errors: [], warnings: [], repairs: [] }
  const surfaces: SurfaceSummary[] = []

  if (messages.length !== 1) {
    ctx.errors.push(`expected exactly ONE message in the top-level array, got ${String(messages.length)}.`)
    return { ...ctx, surfaces }
  }
  const message = messages[0]
  if (!isObj(message) || !isObj(message.createSurface)) {
    ctx.errors.push('the message must be {"version":"1.0","createSurface":{"surfaceId","catalogId","components":[...]}}.')
    return { ...ctx, surfaces }
  }
  const surface = message.createSurface
  if (typeof surface.surfaceId !== 'string' || typeof surface.catalogId !== 'string') {
    ctx.errors.push('createSurface needs string "surfaceId" and "catalogId".')
  }
  if (!Array.isArray(surface.components) || surface.components.length === 0) {
    ctx.errors.push('createSurface.components must be a non-empty array.')
    return { ...ctx, surfaces }
  }

  const byId = new Map<string, ParsedComponent>()
  surface.components.forEach((raw: unknown, i) => {
    const parsed = validateComponent(raw, `components[${String(i)}]`, ctx)
    if (!parsed) return
    if (byId.has(parsed.id)) ctx.errors.push(`duplicate component id "${parsed.id}".`)
    byId.set(parsed.id, parsed)
  })

  if (!byId.has('root')) {
    ctx.errors.push('there must be a component with id "root"; every other component must be reachable from it.')
  } else {
    for (const comp of byId.values()) {
      for (const ref of comp.refs) {
        if (!byId.has(ref)) ctx.errors.push(`component "${comp.id}" (${comp.type}) references undefined component id "${ref}".`)
      }
    }
    const state = new Map<string, 'visiting' | 'done'>()
    const visit = (id: string, trail: string[]): void => {
      const comp = byId.get(id)
      if (!comp) return
      if (state.get(id) === 'visiting') {
        ctx.errors.push(`component cycle ${[...trail, id].join(' -> ')}.`)
        return
      }
      if (state.get(id) === 'done') return
      state.set(id, 'visiting')
      for (const ref of comp.refs) visit(ref, [...trail, id])
      state.set(id, 'done')
    }
    visit('root', [])
    for (const id of byId.keys()) {
      if (!state.has(id)) ctx.warnings.push(`component "${id}" is not reachable from "root" and will not render.`)
    }
  }

  // DataTable rows should carry the keys their columns declare.
  for (const raw of surface.components as unknown[]) {
    if (!isObj(raw) || raw.component !== 'DataTable' || !Array.isArray(raw.columns) || !Array.isArray(raw.rows)) continue
    const keys = raw.columns.filter(isObj).map(c => c.key).filter((k): k is string => typeof k === 'string')
    raw.rows.forEach((row: unknown, i) => {
      if (!isObj(row)) return
      for (const key of keys) {
        if (!(key in row)) ctx.warnings.push(`DataTable "${String(raw.id)}" rows[${String(i)}] has no value for column key "${key}".`)
      }
    })
  }

  surfaces.push({
    surfaceId: typeof surface.surfaceId === 'string' ? surface.surfaceId : '',
    catalogId: typeof surface.catalogId === 'string' ? surface.catalogId : '',
    componentCount: byId.size,
  })
  return { ...ctx, surfaces }
}
