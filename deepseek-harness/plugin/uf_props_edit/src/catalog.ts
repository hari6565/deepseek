/**
 * Reads the node capability catalog at D:\jsonpreparation\nodes\catalog
 * (see its own README.md) -- the retrieval side of this plugin's RAG
 * design. One `props/<nodeKey>.json` file per node kind, each holding the
 * exact prop entries (name/_type/selectionList/current value) that node
 * legally supports, copied verbatim from the real NDP.json this repo's
 * downstream code-gen service reads.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export interface PropEntry {
  name?: string
  _label?: string
  _type?: string
  value?: unknown
  enabled?: unknown
  selectionList?: unknown
  subSelection?: Record<string, unknown>
  items?: unknown[]
  _description?: string
  [key: string]: unknown
}

export interface PropsCatalogFile {
  nodeKey: string
  nodeType: string
  nodeGroupType?: string
  component?: string | null
  count: number
  props: PropEntry[]
}

/**
 * The catalog's `nodeKey` is the UFS `type`, except the seven structurally
 * different components that all share `nodeType: "group"` in NDP.json --
 * those are told apart by nodeGroupType instead (see catalog/README.md §1).
 */
export function catalogKeyFor(nodeType: string, groupType: string | undefined): string {
  if (nodeType === 'group') return groupType ?? 'group'
  return nodeType
}

const fileCache = new Map<string, PropsCatalogFile | null>()

export function loadPropsCatalog(catalogDir: string, catalogKey: string): PropsCatalogFile | null {
  const cacheKey = `${catalogDir}::${catalogKey}`
  const cached = fileCache.get(cacheKey)
  if (cached !== undefined) return cached

  const file = join(catalogDir, 'props', `${catalogKey}.json`)
  if (!existsSync(file)) {
    fileCache.set(cacheKey, null)
    return null
  }
  const parsed = JSON.parse(readFileSync(file, 'utf8')) as PropsCatalogFile
  fileCache.set(cacheKey, parsed)
  return parsed
}

/**
 * Generic deep-walk over a prop tree, visiting every object that carries a
 * `name` field. Catalog nesting isn't just "prop -> subSelection -> prop" --
 * e.g. a conditionalBoolean's `subSelection._true` is itself a plain wrapper
 * object ({ content: {...}, position: {...} }) with no `name` of its own,
 * so the actual nested prop entries sit one level deeper still. Recursing
 * into every object-valued property (not just the known `subSelection` /
 * `items` keys) reaches those regardless of exactly how deep they're wrapped.
 */
function walkPropTree(node: unknown, visit: (entry: Record<string, unknown>) => void): void {
  if (Array.isArray(node)) {
    for (const item of node) walkPropTree(item, visit)
    return
  }
  if (!node || typeof node !== 'object') return
  const obj = node as Record<string, unknown>
  if (typeof obj.name === 'string') visit(obj)
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object') walkPropTree(value, visit)
  }
}

/** Collects every legal prop `name` in a catalog file's props tree (top-level and nested, any depth). */
export function legalPropNames(catalogFile: PropsCatalogFile): Set<string> {
  const names = new Set<string>()
  walkPropTree(catalogFile.props, (entry) => { names.add(entry.name as string) })
  return names
}

/**
 * Finds an EXISTING prop entry (top-level or nested, any depth) by name,
 * for in-place mutation. Never fabricates a new entry -- an edit whose name
 * has no match here gets skipped by the caller rather than invented from
 * scratch.
 */
export function findPropEntry(props: unknown[], name: string): Record<string, unknown> | undefined {
  let found: Record<string, unknown> | undefined
  walkPropTree(props, (entry) => {
    if (!found && entry.name === name) found = entry
  })
  return found
}
