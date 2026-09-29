'use client'
import React, { useState, useMemo, useCallback } from 'react'
import clsx from 'clsx'
import {
  FaChevronRight,
  FaChevronDown,
  FaPlus,
  FaTrashAlt,
  FaEdit,
  FaCopy,
  FaExchangeAlt,
  FaTimes,
  FaCheck
} from 'react-icons/fa'
import { useGlobal } from '@/context/GlobalContext'

// ==================== Types ====================
type DiffStatus = 'added' | 'removed' | 'changed' | 'unchanged'
interface DiffMap {
  [path: string]: DiffStatus
}

type ChangeStyle = 'github' | 'normal'
type GithubLayout = 'unified' | 'split'

// ==================== Type Helpers ====================
function getType(val: any): string {
  if (val === undefined) return 'undefined'
  if (val === null) return 'null'
  if (Array.isArray(val)) return 'array'
  return typeof val
}

function getTypeLabel(val: any): string {
  const t = getType(val)
  if (t === 'array') return `Array[${val.length}]`
  if (t === 'object') return `Object{${Object.keys(val).length}}`
  return t
}

// ==================== Diff Computation ====================
function computeDiff(left: any, right: any, path: string = ''): DiffMap {
  const diff: DiffMap = {}
  const lt = getType(left)
  const rt = getType(right)

  if (
    (lt === 'undefined' || lt === 'null') &&
    (rt === 'undefined' || rt === 'null')
  ) {
    if (lt === 'null' && rt === 'null') diff[path] = 'unchanged'
    return diff
  }

  if (lt === 'undefined' || lt === 'null') {
    markAllPaths(right, path, 'added', diff)
    return diff
  }

  if (rt === 'undefined' || rt === 'null') {
    markAllPaths(left, path, 'removed', diff)
    return diff
  }

  if (lt !== rt) {
    diff[path] = 'changed'
    return diff
  }

  if (lt !== 'object' && lt !== 'array') {
    diff[path] = left === right ? 'unchanged' : 'changed'
    return diff
  }

  if (lt === 'array') {
    const max = Math.max(left.length, right.length)
    let hasDiff = false
    for (let i = 0; i < max; i++) {
      const cp = `${path}/${i}`
      if (i >= left.length) {
        markAllPaths(right[i], cp, 'added', diff)
        hasDiff = true
      } else if (i >= right.length) {
        markAllPaths(left[i], cp, 'removed', diff)
        hasDiff = true
      } else {
        const cd = computeDiff(left[i], right[i], cp)
        Object.assign(diff, cd)
        if (Object.values(cd).some(s => s !== 'unchanged')) hasDiff = true
      }
    }
    diff[path] = hasDiff ? 'changed' : 'unchanged'
    return diff
  }

  const keys = Array.from(
    new Set([...Object.keys(left), ...Object.keys(right)])
  )
  let hasDiff = false
  for (const key of keys) {
    const cp = `${path}/${key}`
    if (!(key in left)) {
      markAllPaths(right[key], cp, 'added', diff)
      hasDiff = true
    } else if (!(key in right)) {
      markAllPaths(left[key], cp, 'removed', diff)
      hasDiff = true
    } else {
      const cd = computeDiff(left[key], right[key], cp)
      Object.assign(diff, cd)
      if (Object.values(cd).some(s => s !== 'unchanged')) hasDiff = true
    }
  }
  diff[path] = hasDiff ? 'changed' : 'unchanged'
  return diff
}

function markAllPaths(
  val: any,
  path: string,
  status: DiffStatus,
  diff: DiffMap
) {
  diff[path] = status
  if (val !== null && val !== undefined && typeof val === 'object') {
    if (Array.isArray(val)) {
      val.forEach((item: any, i: number) =>
        markAllPaths(item, `${path}/${i}`, status, diff)
      )
    } else {
      Object.keys(val).forEach(k =>
        markAllPaths(val[k], `${path}/${k}`, status, diff)
      )
    }
  }
}

// ==================== Path Utilities ====================
function splitPath(path: string): string[] {
  return path.replace(/^\//, '').split('/').filter(Boolean)
}

function navigateTo(root: any, keys: string[]): any {
  let current = root
  for (const k of keys) {
    if (current === undefined || current === null) return undefined
    const idx = Number(k)
    current = !isNaN(idx) && Array.isArray(current) ? current[idx] : current[k]
  }
  return current
}

function updateAtPath(root: any, path: string, value: any): any {
  const clone = JSON.parse(JSON.stringify(root))
  const keys = splitPath(path)
  if (keys.length === 0) return value
  const parent = navigateTo(clone, keys.slice(0, -1))
  if (!parent) return clone
  const last = keys[keys.length - 1]
  const idx = Number(last)
  if (!isNaN(idx) && Array.isArray(parent)) parent[idx] = value
  else parent[last] = value
  return clone
}

function removeAtPath(root: any, path: string): any {
  const clone = JSON.parse(JSON.stringify(root))
  const keys = splitPath(path)
  if (keys.length === 0) return clone
  const parent = navigateTo(clone, keys.slice(0, -1))
  if (!parent) return clone
  const last = keys[keys.length - 1]
  const idx = Number(last)
  if (!isNaN(idx) && Array.isArray(parent)) parent.splice(idx, 1)
  else delete parent[last]
  return clone
}

function insertAtPath(root: any, path: string, key: string, value: any): any {
  const clone = JSON.parse(JSON.stringify(root))
  const keys = splitPath(path)
  const target = keys.length === 0 ? clone : navigateTo(clone, keys)
  if (!target) return clone
  if (Array.isArray(target)) target.push(value)
  else if (typeof target === 'object') target[key] = value
  return clone
}

// ==================== Diff Styling ====================
const DIFF_BORDER: Record<DiffStatus, string> = {
  added: 'border-l-green-500',
  removed: 'border-l-red-500',
  changed: 'border-l-amber-500',
  unchanged: 'border-l-transparent'
}

function getDiffBg(isDark: boolean): Record<DiffStatus, string> {
  return {
    added: isDark ? 'bg-green-900/30' : 'bg-green-50/60',
    removed: isDark ? 'bg-red-900/30' : 'bg-red-50/60',
    changed: isDark ? 'bg-amber-900/30' : 'bg-amber-50/60',
    unchanged: ''
  }
}

function getDiffBadge(isDark: boolean): Record<DiffStatus, { label: string; cls: string } | null> {
  return {
    added: { label: 'Added', cls: isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700' },
    removed: { label: 'Removed', cls: isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700' },
    changed: { label: 'Modified', cls: isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-700' },
    unchanged: null
  }
}

// ==================== TreeNode Component ====================
function TreeNode({
  data,
  path,
  keyName,
  diffMap,
  onUpdate,
  onDelete,
  onAdd,
  isRoot = false,
  defaultExpanded = true,
  isDark = false
}: {
  data: any
  path: string
  keyName?: string
  diffMap?: DiffMap
  onUpdate: (path: string, value: any) => void
  onDelete: (path: string) => void
  onAdd: (path: string, key: string, value: any) => void
  isRoot?: boolean
  defaultExpanded?: boolean
  isDark?: boolean
}) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [editing, setEditing] = useState(false)
  const [editVal, setEditVal] = useState('')
  const [adding, setAdding] = useState(false)
  const [newKey, setNewKey] = useState('')
  const [newVal, setNewVal] = useState('')

  const type = getType(data)
  const isComplex = type === 'object' || type === 'array'
  const status = diffMap?.[path]
  const DIFF_BG = getDiffBg(isDark)
  const DIFF_BADGE = getDiffBadge(isDark)
  const borderCls = status ? DIFF_BORDER[status] : 'border-l-transparent'
  const bgCls = status ? DIFF_BG[status] : ''
  const badge = status ? DIFF_BADGE[status] : null

  const beginEdit = () => {
    setEditVal(type === 'string' ? data : JSON.stringify(data))
    setEditing(true)
  }

  const saveEdit = () => {
    let parsed: any
    try {
      parsed = JSON.parse(editVal)
    } catch {
      parsed = editVal
    }
    onUpdate(path, parsed)
    setEditing(false)
  }

  const submitAdd = () => {
    if (!newVal.trim()) return
    if (type === 'object' && !newKey.trim()) return
    let parsed: any
    try {
      parsed = JSON.parse(newVal)
    } catch {
      parsed = newVal
    }
    onAdd(path, newKey, parsed)
    setAdding(false)
    setNewKey('')
    setNewVal('')
  }

  // ---- Primitive Node ----
  if (!isComplex) {
    return (
      <div
        className={clsx(
          'group my-0.5 flex items-center gap-2 rounded border-l-4 px-3 py-1.5',
          borderCls,
          bgCls
        )}
      >
        {keyName !== undefined && (
          <>
            <span className={clsx('shrink-0 font-mono text-sm font-semibold', isDark ? 'text-purple-400' : 'text-purple-700')}>
              {keyName}
            </span>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>:</span>
          </>
        )}

        {editing ? (
          <div className='flex flex-1 items-center gap-1'>
            <input
              value={editVal}
              onChange={e => setEditVal(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') saveEdit()
                if (e.key === 'Escape') setEditing(false)
              }}
              className={clsx(
                'flex-1 rounded border px-2 py-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400',
                isDark ? 'border-blue-600 bg-gray-700 text-gray-200' : 'border-blue-300 bg-white text-gray-900'
              )}
              autoFocus
            />
            <button
              onClick={saveEdit}
              className='rounded bg-green-500 p-1.5 text-white hover:bg-green-600'
            >
              <FaCheck size={10} />
            </button>
            <button
              onClick={() => setEditing(false)}
              className={clsx('rounded p-1.5 text-white', isDark ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-400 hover:bg-gray-500')}
            >
              <FaTimes size={10} />
            </button>
          </div>
        ) : (
          <>
            <span
              className={clsx('font-mono text-sm', {
                [isDark ? 'text-emerald-400' : 'text-emerald-700']: type === 'boolean',
                [isDark ? 'text-blue-400' : 'text-blue-700']: type === 'number',
                [isDark ? 'text-rose-400' : 'text-rose-700']: type === 'string',
                [isDark ? 'italic text-gray-500' : 'italic text-gray-400']: type === 'null'
              })}
            >
              {type === 'string' ? `"${data}"` : String(data)}
            </span>
            <span className={clsx('rounded px-1.5 py-0.5 text-[10px] font-medium', isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500')}>
              {type}
            </span>
            {badge && (
              <span
                className={clsx(
                  'rounded px-1.5 py-0.5 text-[10px] font-medium',
                  badge.cls
                )}
              >
                {badge.label}
              </span>
            )}
            <div className='ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
              <button
                onClick={beginEdit}
                className={clsx('rounded p-1', isDark ? 'text-gray-500 hover:bg-blue-900/40 hover:text-blue-400' : 'text-gray-400 hover:bg-blue-100 hover:text-blue-600')}
                title='Edit'
              >
                <FaEdit size={12} />
              </button>
              {!isRoot && (
                <button
                  onClick={() => onDelete(path)}
                  className={clsx('rounded p-1', isDark ? 'text-gray-500 hover:bg-red-900/40 hover:text-red-400' : 'text-gray-400 hover:bg-red-100 hover:text-red-600')}
                  title='Delete'
                >
                  <FaTrashAlt size={12} />
                </button>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  // ---- Object / Array Node ----
  const isArr = type === 'array'
  const entries: [string, any][] = isArr
    ? (data as any[]).map((v: any, i: number) => [String(i), v])
    : Object.entries(data)

  return (
    <div className={clsx('my-0.5 rounded border-l-4', borderCls, bgCls)}>
      {/* Header */}
      <div
        className='group flex cursor-pointer items-center gap-2 px-3 py-1.5'
        onClick={() => setExpanded(!expanded)}
      >
        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          {expanded ? (
            <FaChevronDown size={10} />
          ) : (
            <FaChevronRight size={10} />
          )}
        </span>
        {keyName !== undefined && (
          <>
            <span className={clsx('shrink-0 font-mono text-sm font-semibold', isDark ? 'text-purple-400' : 'text-purple-700')}>
              {keyName}
            </span>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>:</span>
          </>
        )}
        <span
          className={clsx(
            'rounded px-1.5 py-0.5 text-xs font-medium',
            isArr
              ? (isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-700')
              : (isDark ? 'bg-violet-900/50 text-violet-400' : 'bg-violet-100 text-violet-700')
          )}
        >
          {getTypeLabel(data)}
        </span>
        {badge && (
          <span
            className={clsx(
              'rounded px-1.5 py-0.5 text-[10px] font-medium',
              badge.cls
            )}
          >
            {badge.label}
          </span>
        )}
        <div
          className='ml-auto flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'
          onClick={e => e.stopPropagation()}
        >
          <button
            onClick={() => setAdding(!adding)}
            className={clsx('rounded p-1', isDark ? 'text-gray-500 hover:bg-blue-900/40 hover:text-blue-400' : 'text-gray-400 hover:bg-blue-100 hover:text-blue-600')}
            title='Add'
          >
            <FaPlus size={12} />
          </button>
          {!isRoot && (
            <button
              onClick={() => onDelete(path)}
              className={clsx('rounded p-1', isDark ? 'text-gray-500 hover:bg-red-900/40 hover:text-red-400' : 'text-gray-400 hover:bg-red-100 hover:text-red-600')}
              title='Delete'
            >
              <FaTrashAlt size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Inline Add Form */}
      {adding && (
        <div
          className={clsx(
            'mx-3 mb-2 flex items-center gap-2 rounded border p-2',
            isDark ? 'border-blue-700 bg-blue-900/30' : 'border-blue-200 bg-blue-50'
          )}
          onClick={e => e.stopPropagation()}
        >
          {!isArr && (
            <input
              value={newKey}
              onChange={e => setNewKey(e.target.value)}
              placeholder='Key name'
              className={clsx(
                'w-28 rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400',
                isDark ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-900'
              )}
            />
          )}
          <input
            value={newVal}
            onChange={e => setNewVal(e.target.value)}
            placeholder='Value (JSON or text)'
            className={clsx(
              'flex-1 rounded border px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400',
              isDark ? 'border-gray-600 bg-gray-700 text-gray-200' : 'border-gray-300 bg-white text-gray-900'
            )}
            onKeyDown={e => {
              if (e.key === 'Enter') submitAdd()
            }}
          />
          <button
            onClick={submitAdd}
            className='rounded bg-blue-500 px-3 py-1 text-xs font-medium text-white hover:bg-blue-600'
          >
            Add
          </button>
          <button
            onClick={() => {
              setAdding(false)
              setNewKey('')
              setNewVal('')
            }}
            className={clsx('rounded px-3 py-1 text-xs font-medium', isDark ? 'bg-gray-600 text-gray-200 hover:bg-gray-500' : 'bg-gray-300 text-gray-700 hover:bg-gray-400')}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Children */}
      {expanded && (
        <div className={clsx('ml-4 border-l pl-2', isDark ? 'border-gray-700' : 'border-gray-200')}>
          {entries.length === 0 ? (
            <div className={clsx('px-3 py-1.5 text-sm italic', isDark ? 'text-gray-500' : 'text-gray-400')}>
              {isArr ? 'Empty array' : 'Empty object'}
            </div>
          ) : (
            entries.map(([key, val]) => (
              <TreeNode
                key={key}
                data={val}
                path={`${path}/${key}`}
                keyName={key}
                diffMap={diffMap}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onAdd={onAdd}
                isDark={isDark}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

// ==================== JsonPanel Component ====================
function JsonPanel({
  title,
  text,
  setText,
  data,
  setData,
  error,
  onParse,
  diffMap,
  accent,
  isDark = false
}: {
  title: string
  text: string
  setText: (v: string) => void
  data: any
  setData: (v: any) => void
  error: string
  onParse: () => void
  diffMap?: DiffMap
  accent: 'blue' | 'emerald'
  isDark?: boolean
}) {
  const [showRaw, setShowRaw] = useState(false)

  const handleUpdate = useCallback(
    (path: string, value: any) => {
      const updated = updateAtPath(data, path, value)
      setData(updated)
      setText(JSON.stringify(updated, null, 2))
    },
    [data, setData, setText]
  )

  const handleDelete = useCallback(
    (path: string) => {
      const updated = removeAtPath(data, path)
      setData(updated)
      setText(JSON.stringify(updated, null, 2))
    },
    [data, setData, setText]
  )

  const handleAdd = useCallback(
    (path: string, key: string, value: any) => {
      const updated = insertAtPath(data, path, key, value)
      setData(updated)
      setText(JSON.stringify(updated, null, 2))
    },
    [data, setData, setText]
  )

  const handleCopy = () => {
    const content = data ? JSON.stringify(data, null, 2) : text
    navigator.clipboard.writeText(content)
  }

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(text)
      setText(JSON.stringify(parsed, null, 2))
    } catch {
      // ignore format errors
    }
  }

  const colors =
    accent === 'blue'
      ? {
          header: isDark ? 'bg-blue-900/30 border-blue-700' : 'bg-blue-50 border-blue-200',
          title: isDark ? 'text-blue-300' : 'text-blue-800',
          btn: isDark ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'
        }
      : {
          header: isDark ? 'bg-emerald-900/30 border-emerald-700' : 'bg-emerald-50 border-emerald-200',
          title: isDark ? 'text-emerald-300' : 'text-emerald-800',
          btn: isDark ? 'bg-emerald-700 hover:bg-emerald-600' : 'bg-emerald-600 hover:bg-emerald-700'
        }

  return (
    <div className={clsx(
      'flex h-full flex-col overflow-hidden rounded-lg border shadow-sm',
      isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
    )}>
      {/* Panel Header */}
      <div
        className={clsx(
          'flex items-center justify-between border-b px-4 py-2.5',
          colors.header
        )}
      >
        <h3 className={clsx('text-sm font-semibold', colors.title)}>{title}</h3>
        <div className='flex gap-1.5'>
          {false && (
          <button
            onClick={handleCopy}
            className={clsx(
              'flex items-center gap-1 rounded border px-2 py-1 text-xs',
              isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50'
            )}
            title='Copy'
          >
            <FaCopy size={10} /> Copy
          </button>
          )}
          {(showRaw || data === null) && (
            <button
              onClick={handleFormat}
              className={clsx(
                'rounded border px-2 py-1 text-xs',
                isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50'
              )}
            >
              Format
            </button>
          )}
          {data !== null && (
            <button
              onClick={() => setShowRaw(!showRaw)}
              className={clsx(
                'rounded px-2 py-1 text-xs font-medium',
                showRaw
                  ? (isDark ? 'bg-gray-600 text-white' : 'bg-gray-700 text-white')
                  : (isDark ? 'border border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'border bg-white text-gray-600 hover:bg-gray-50')
              )}
            >
              {showRaw ? 'Tree View' : 'Raw JSON'}
            </button>
          )}
          <button
            onClick={() => {
              setText('')
              setData(null)
              setShowRaw(false)
            }}
            className={clsx(
              'rounded border px-2 py-1 text-xs',
              isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-red-900/40 hover:text-red-400' : 'bg-white text-gray-600 hover:bg-red-50 hover:text-red-600'
            )}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Panel Body */}
      <div className='flex-1 overflow-auto'>
        {showRaw || data === null ? (
          <div className='flex h-full flex-col'>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder='Paste your JSON here...'
              className={clsx(
                'w-full flex-1 resize-none bg-transparent p-4 font-mono text-sm outline-none',
                isDark ? 'text-gray-200 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'
              )}
              spellCheck={false}
            />
            {error && (
              <div className={clsx(
                'border-t px-4 py-2 text-sm',
                isDark ? 'border-red-800 bg-red-900/30 text-red-400' : 'border-red-200 bg-red-50 text-red-600'
              )}>
                {error}
              </div>
            )}
            <div className={clsx('border-t p-2.5', isDark ? 'border-gray-700' : 'border-gray-200')}>
              <button
                onClick={onParse}
                className={clsx(
                  'w-full rounded py-2 text-sm font-semibold text-white',
                  colors.btn
                )}
              >
                Parse JSON
              </button>
            </div>
          </div>
        ) : (
          <div className='overflow-auto p-3'>
            <TreeNode
              data={data}
              path=''
              diffMap={diffMap}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAdd={handleAdd}
              isRoot
              isDark={isDark}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ==================== Line Diff (LCS) for GitHub View ====================
type LineDiffType = 'equal' | 'add' | 'remove'
interface LineDiffEntry {
  type: LineDiffType
  content: string
  leftLine?: number
  rightLine?: number
}

function computeLineDiff(leftStr: string, rightStr: string): LineDiffEntry[] {
  const leftLines = leftStr.split('\n')
  const rightLines = rightStr.split('\n')
  const n = leftLines.length
  const m = rightLines.length

  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array(m + 1).fill(0)
  )
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (leftLines[i - 1] === rightLines[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const stack: LineDiffEntry[] = []
  let i = n
  let j = m
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && leftLines[i - 1] === rightLines[j - 1]) {
      stack.push({
        type: 'equal',
        content: leftLines[i - 1],
        leftLine: i,
        rightLine: j
      })
      i--
      j--
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      stack.push({ type: 'add', content: rightLines[j - 1], rightLine: j })
      j--
    } else {
      stack.push({ type: 'remove', content: leftLines[i - 1], leftLine: i })
      i--
    }
  }

  stack.reverse()
  return stack
}

// ==================== GitHub Unified Diff View ====================
function GithubUnifiedDiffView({
  leftData,
  rightData,
  isDark = false
}: {
  leftData: any
  rightData: any
  isDark?: boolean
}) {
  const diffLines = useMemo(() => {
    const leftStr = JSON.stringify(leftData, null, 2)
    const rightStr = JSON.stringify(rightData, null, 2)
    return computeLineDiff(leftStr, rightStr)
  }, [leftData, rightData])

  const stats = useMemo(() => {
    let additions = 0
    let deletions = 0
    for (const l of diffLines) {
      if (l.type === 'add') additions++
      if (l.type === 'remove') deletions++
    }
    return { additions, deletions, total: additions + deletions }
  }, [diffLines])

  const handleCopy = () => {
    const text = diffLines
      .map(l => {
        const prefix = l.type === 'remove' ? '-' : l.type === 'add' ? '+' : ' '
        return `${prefix} ${l.content}`
      })
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  return (
    <div className={clsx(
      'flex h-full flex-col overflow-hidden rounded-lg border shadow-sm',
      isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
    )}>
      {/* GitHub-style file header */}
      <div className={clsx(
        'flex items-center gap-3 border-b px-4 py-2',
        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
      )}>
        <svg
          className={clsx('h-4 w-4', isDark ? 'text-gray-400' : 'text-gray-500')}
          viewBox='0 0 16 16'
          fill='currentColor'
        >
          <path d='M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z' />
        </svg>
        <span className={clsx('font-mono text-sm font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>
          json diff
        </span>
        <div className='flex items-center gap-2 text-xs'>
          <span className={clsx('font-semibold', isDark ? 'text-green-400' : 'text-green-700')}>
            +{stats.additions}
          </span>
          <span className={clsx('font-semibold', isDark ? 'text-red-400' : 'text-red-700')}>-{stats.deletions}</span>
        </div>
        {stats.total > 0 && (
          <div className={clsx('flex h-2 w-28 overflow-hidden rounded-full', isDark ? 'bg-gray-600' : 'bg-gray-200')}>
            {stats.additions > 0 && (
              <div
                className='bg-green-500'
                style={{
                  width: `${(stats.additions / stats.total) * 100}%`
                }}
              />
            )}
            {stats.deletions > 0 && (
              <div
                className='bg-red-500'
                style={{
                  width: `${(stats.deletions / stats.total) * 100}%`
                }}
              />
            )}
          </div>
        )}
        {false && (
        <button
          onClick={handleCopy}
          className={clsx(
            'ml-auto flex items-center gap-1 rounded border px-2 py-1 text-xs',
            isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          <FaCopy size={10} /> Copy diff
        </button>)}
      </div>

      {/* Diff table */}
      <div className='flex-1 overflow-auto'>
        <table className='w-full border-collapse font-mono text-[13px] leading-5'>
          <tbody>
            {diffLines.map((line, idx) => (
              <tr
                key={idx}
                className={clsx({
                  [isDark ? 'bg-red-900/20' : 'bg-red-50']: line.type === 'remove',
                  [isDark ? 'bg-green-900/20' : 'bg-green-50']: line.type === 'add',
                  [isDark ? 'bg-gray-800' : 'bg-white']: line.type === 'equal'
                })}
              >
                <td
                  className={clsx(
                    'w-[1%] min-w-[40px] select-none border-r px-2 text-right text-xs',
                    {
                      [isDark ? 'border-r-red-800 bg-red-900/40 text-red-500' : 'border-r-red-200 bg-red-100/80 text-red-400']:
                        line.type === 'remove',
                      [isDark ? 'border-r-green-800 bg-green-900/40 text-green-500' : 'border-r-green-200 bg-green-100/80 text-green-400']:
                        line.type === 'add',
                      [isDark ? 'border-r-gray-700 text-gray-500' : 'border-r-gray-200 text-gray-400']: line.type === 'equal'
                    }
                  )}
                >
                  {line.type !== 'add' ? line.leftLine : ''}
                </td>
                <td
                  className={clsx(
                    'w-[1%] min-w-[40px] select-none border-r px-2 text-right text-xs',
                    {
                      [isDark ? 'border-r-red-800 bg-red-900/40 text-red-500' : 'border-r-red-200 bg-red-100/80 text-red-400']:
                        line.type === 'remove',
                      [isDark ? 'border-r-green-800 bg-green-900/40 text-green-500' : 'border-r-green-200 bg-green-100/80 text-green-400']:
                        line.type === 'add',
                      [isDark ? 'border-r-gray-700 text-gray-500' : 'border-r-gray-200 text-gray-400']: line.type === 'equal'
                    }
                  )}
                >
                  {line.type !== 'remove' ? line.rightLine : ''}
                </td>
                <td
                  className={clsx(
                    'w-[1%] select-none px-1 text-center font-bold',
                    {
                      [isDark ? 'bg-red-900/30 text-red-500' : 'bg-red-100/60 text-red-600']: line.type === 'remove',
                      [isDark ? 'bg-green-900/30 text-green-500' : 'bg-green-100/60 text-green-600']: line.type === 'add',
                      'text-transparent': line.type === 'equal'
                    }
                  )}
                >
                  {line.type === 'remove'
                    ? '-'
                    : line.type === 'add'
                    ? '+'
                    : '\u00A0'}
                </td>
                <td
                  className={clsx('whitespace-pre px-3', {
                    [isDark ? 'text-red-300' : 'text-red-800']: line.type === 'remove',
                    [isDark ? 'text-green-300' : 'text-green-800']: line.type === 'add',
                    [isDark ? 'text-gray-300' : 'text-gray-700']: line.type === 'equal'
                  })}
                >
                  {line.content}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== GitHub Split Diff View ====================
interface SplitRow {
  left: LineDiffEntry | null
  right: LineDiffEntry | null
}

function buildSplitRows(lines: LineDiffEntry[]): SplitRow[] {
  const rows: SplitRow[] = []
  let i = 0
  while (i < lines.length) {
    if (lines[i].type === 'equal') {
      rows.push({ left: lines[i], right: lines[i] })
      i++
    } else {
      const removes: LineDiffEntry[] = []
      while (i < lines.length && lines[i].type === 'remove') {
        removes.push(lines[i])
        i++
      }
      const adds: LineDiffEntry[] = []
      while (i < lines.length && lines[i].type === 'add') {
        adds.push(lines[i])
        i++
      }
      const max = Math.max(removes.length, adds.length)
      for (let k = 0; k < max; k++) {
        rows.push({
          left: k < removes.length ? removes[k] : null,
          right: k < adds.length ? adds[k] : null
        })
      }
    }
  }
  return rows
}

function GithubSplitDiffView({
  leftData,
  rightData,
  isDark = false
}: {
  leftData: any
  rightData: any
  isDark?: boolean
}) {
  const diffLines = useMemo(() => {
    const leftStr = JSON.stringify(leftData, null, 2)
    const rightStr = JSON.stringify(rightData, null, 2)
    return computeLineDiff(leftStr, rightStr)
  }, [leftData, rightData])

  const splitRows = useMemo(() => buildSplitRows(diffLines), [diffLines])

  const stats = useMemo(() => {
    let additions = 0
    let deletions = 0
    for (const l of diffLines) {
      if (l.type === 'add') additions++
      if (l.type === 'remove') deletions++
    }
    return { additions, deletions, total: additions + deletions }
  }, [diffLines])

  const handleCopy = () => {
    const text = diffLines
      .map(l => {
        const prefix = l.type === 'remove' ? '-' : l.type === 'add' ? '+' : ' '
        return `${prefix} ${l.content}`
      })
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  const leftCellCls = (entry: LineDiffEntry | null) => {
    if (!entry) return isDark ? 'bg-gray-900/50' : 'bg-gray-50'
    if (entry.type === 'remove') return isDark ? 'bg-red-900/20' : 'bg-red-50'
    return isDark ? 'bg-gray-800' : 'bg-white'
  }

  const rightCellCls = (entry: LineDiffEntry | null) => {
    if (!entry) return isDark ? 'bg-gray-900/50' : 'bg-gray-50'
    if (entry.type === 'add') return isDark ? 'bg-green-900/20' : 'bg-green-50'
    return isDark ? 'bg-gray-800' : 'bg-white'
  }

  return (
    <div className={clsx(
      'flex h-full flex-col overflow-hidden rounded-lg border shadow-sm',
      isDark ? 'border-gray-600 bg-gray-800' : 'border-gray-300 bg-white'
    )}>
      {/* Header */}
      <div className={clsx(
        'flex items-center gap-3 border-b px-4 py-2',
        isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-300'
      )}>
        <svg
          className={clsx('h-4 w-4', isDark ? 'text-gray-400' : 'text-gray-500')}
          viewBox='0 0 16 16'
          fill='currentColor'
        >
          <path d='M2 1.75C2 .784 2.784 0 3.75 0h6.586c.464 0 .909.184 1.237.513l2.914 2.914c.329.328.513.773.513 1.237v9.586A1.75 1.75 0 0 1 13.25 16h-9.5A1.75 1.75 0 0 1 2 14.25Zm1.75-.25a.25.25 0 0 0-.25.25v12.5c0 .138.112.25.25.25h9.5a.25.25 0 0 0 .25-.25V6h-2.75A1.75 1.75 0 0 1 9 4.25V1.5Zm6.75.062V4.25c0 .138.112.25.25.25h2.688l-.011-.013-2.914-2.914-.013-.011Z' />
        </svg>
        <span className={clsx('font-mono text-sm font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>
          json diff
        </span>
        <div className='flex items-center gap-2 text-xs'>
          <span className={clsx('font-semibold', isDark ? 'text-green-400' : 'text-green-700')}>
            +{stats.additions}
          </span>
          <span className={clsx('font-semibold', isDark ? 'text-red-400' : 'text-red-700')}>-{stats.deletions}</span>
        </div>
        {stats.total > 0 && (
          <div className={clsx('flex h-2 w-28 overflow-hidden rounded-full', isDark ? 'bg-gray-600' : 'bg-gray-200')}>
            {stats.additions > 0 && (
              <div
                className='bg-green-500'
                style={{
                  width: `${(stats.additions / stats.total) * 100}%`
                }}
              />
            )}
            {stats.deletions > 0 && (
              <div
                className='bg-red-500'
                style={{
                  width: `${(stats.deletions / stats.total) * 100}%`
                }}
              />
            )}
          </div>
        )}
        <button
          onClick={handleCopy}
          className={clsx(
            'ml-auto flex items-center gap-1 rounded border px-2 py-1 text-xs',
            isDark ? 'border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-50'
          )}
        >
          <FaCopy size={10} /> Copy diff
        </button>
      </div>

      {/* Split diff table */}
      <div className='flex-1 overflow-auto'>
        <table className='w-full border-collapse font-mono text-[13px] leading-5'>
          <tbody>
            {splitRows.map((row, idx) => (
              <tr key={idx}>
                {/* ===== LEFT SIDE ===== */}
                <td
                  className={clsx(
                    'w-[1%] min-w-[36px] select-none border-r px-2 text-right text-xs',
                    row.left?.type === 'remove'
                      ? (isDark ? 'border-r-red-800 bg-red-900/40 text-red-500' : 'border-r-red-200 bg-red-100/80 text-red-400')
                      : !row.left
                      ? (isDark ? 'border-r-gray-700 bg-gray-900/50 text-gray-600' : 'border-r-gray-200 bg-gray-50 text-gray-300')
                      : (isDark ? 'border-r-gray-700 text-gray-500' : 'border-r-gray-200 text-gray-400')
                  )}
                >
                  {row.left?.leftLine ?? ''}
                </td>
                <td
                  className={clsx(
                    'w-[1%] select-none px-1 text-center font-bold',
                    row.left?.type === 'remove'
                      ? (isDark ? 'bg-red-900/30 text-red-500' : 'bg-red-100/60 text-red-600')
                      : !row.left
                      ? (isDark ? 'bg-gray-900/50 text-gray-600' : 'bg-gray-50 text-gray-300')
                      : 'text-transparent'
                  )}
                >
                  {row.left?.type === 'remove' ? '-' : '\u00A0'}
                </td>
                <td
                  className={clsx(
                    'w-[49%] whitespace-pre border-r px-3',
                    isDark ? 'border-r-gray-600' : 'border-r-gray-300',
                    leftCellCls(row.left),
                    row.left?.type === 'remove'
                      ? (isDark ? 'text-red-300' : 'text-red-800')
                      : !row.left
                      ? (isDark ? 'text-gray-600' : 'text-gray-300')
                      : (isDark ? 'text-gray-300' : 'text-gray-700')
                  )}
                >
                  {row.left?.content ?? ''}
                </td>

                {/* ===== RIGHT SIDE ===== */}
                <td
                  className={clsx(
                    'w-[1%] min-w-[36px] select-none border-r px-2 text-right text-xs',
                    row.right?.type === 'add'
                      ? (isDark ? 'border-r-green-800 bg-green-900/40 text-green-500' : 'border-r-green-200 bg-green-100/80 text-green-400')
                      : !row.right
                      ? (isDark ? 'border-r-gray-700 bg-gray-900/50 text-gray-600' : 'border-r-gray-200 bg-gray-50 text-gray-300')
                      : (isDark ? 'border-r-gray-700 text-gray-500' : 'border-r-gray-200 text-gray-400')
                  )}
                >
                  {row.right?.rightLine ?? ''}
                </td>
                <td
                  className={clsx(
                    'w-[1%] select-none px-1 text-center font-bold',
                    row.right?.type === 'add'
                      ? (isDark ? 'bg-green-900/30 text-green-500' : 'bg-green-100/60 text-green-600')
                      : !row.right
                      ? (isDark ? 'bg-gray-900/50 text-gray-600' : 'bg-gray-50 text-gray-300')
                      : 'text-transparent'
                  )}
                >
                  {row.right?.type === 'add' ? '+' : '\u00A0'}
                </td>
                <td
                  className={clsx(
                    'w-[49%] whitespace-pre px-3',
                    rightCellCls(row.right),
                    row.right?.type === 'add'
                      ? (isDark ? 'text-green-300' : 'text-green-800')
                      : !row.right
                      ? (isDark ? 'text-gray-600' : 'text-gray-300')
                      : (isDark ? 'text-gray-300' : 'text-gray-700')
                  )}
                >
                  {row.right?.content ?? ''}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ==================== Main Page ====================
export default function JSONEditor({
  className="",
  needCompare = false,
  leftData = {},
  rightData = {},
  setLeftData = () => {},
  setRightData = () => {}
}: any) {
  const { theme } = useGlobal()
  const isDark = theme === 'dark' || theme === 'dark-hc'

  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [leftError, setLeftError] = useState('')
  const [rightError, setRightError] = useState('')
  const [isComparing, setIsComparing] = useState(false)
  const [changeStyle, setChangeStyle] = useState<ChangeStyle>('github')
  const [githubLayout, setGithubLayout] = useState<GithubLayout>('unified')

  const parseLeft = () => {
    try {
      setLeftData(JSON.parse(leftText))
      setLeftError('')
    } catch (e: any) {
      setLeftError(`Parse error: ${e.message}`)
    }
  }

  const parseRight = () => {
    try {
      setRightData(JSON.parse(rightText))
      setRightError('')
    } catch (e: any) {
      setRightError(`Parse error: ${e.message}`)
    }
  }

  const diffMap = useMemo(() => {
    if (!isComparing || leftData === null || rightData === null)
      return undefined
    return computeDiff(leftData, rightData)
  }, [isComparing, leftData, rightData])

  const summary = useMemo(() => {
    if (!diffMap) return null
    const counts = { added: 0, removed: 0, changed: 0, unchanged: 0 }
    for (const s of Object.values(diffMap)) counts[s]++
    return counts
  }, [diffMap])

  const showGithubView =
    isComparing && leftData && rightData && changeStyle === 'github'

  return (
    <div className={clsx('flex h-full w-full flex-col', isDark ? 'bg-gray-900' : 'bg-gray-50', className)}>
      {/* Top Bar */}
      <div className={clsx(
        'flex flex-wrap items-center justify-between gap-3 border-b px-6 py-3 shadow-sm',
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      )}>
        <h1 className={clsx('flex items-center gap-2 text-lg font-bold', isDark ? 'text-gray-200' : 'text-gray-800')}>
          <FaExchangeAlt className='text-indigo-600' />
          JSON Editor & Compare
        </h1>
        <div className='flex items-center gap-3'>
          {/* Diff summary badges */}
          {isComparing && summary && (
            <div className='flex items-center gap-1.5 text-xs'>
              <span className={clsx('rounded-full px-2 py-0.5 font-medium', isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-800')}>
                +{summary.added}
              </span>
              <span className={clsx('rounded-full px-2 py-0.5 font-medium', isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-800')}>
                -{summary.removed}
              </span>
              <span className={clsx('rounded-full px-2 py-0.5 font-medium', isDark ? 'bg-amber-900/50 text-amber-400' : 'bg-amber-100 text-amber-800')}>
                ~{summary.changed}
              </span>
              <span className={clsx('rounded-full px-2 py-0.5 font-medium', isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600')}>
                ={summary.unchanged}
              </span>
            </div>
          )}

          {/* Change Style toggle: GitHub / Normal */}
          {isComparing && (
            <div className={clsx('flex overflow-hidden rounded-lg border', isDark ? 'border-gray-600' : 'border-gray-300')}>
              <button
                onClick={() => setChangeStyle('github')}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium',
                  changeStyle === 'github'
                    ? 'bg-gray-800 text-white'
                    : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100')
                )}
              >
                GitHub
              </button>
              <button
                onClick={() => setChangeStyle('normal')}
                className={clsx(
                  'border-l px-3 py-1.5 text-xs font-medium',
                  isDark ? 'border-gray-600' : 'border-gray-300',
                  changeStyle === 'normal'
                    ? 'bg-gray-800 text-white'
                    : (isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-white text-gray-600 hover:bg-gray-100')
                )}
              >
                Normal
              </button>
            </div>
          )}

          {/* GitHub sub-layout toggle: Unified / Split (only when GitHub is active) */}
          {isComparing && changeStyle === 'github' && (
            <div className={clsx('flex overflow-hidden rounded-lg border', isDark ? 'border-indigo-700' : 'border-indigo-300')}>
              <button
                onClick={() => setGithubLayout('unified')}
                className={clsx(
                  'px-3 py-1.5 text-xs font-medium',
                  githubLayout === 'unified'
                    ? 'bg-indigo-600 text-white'
                    : (isDark ? 'bg-gray-700 text-indigo-400 hover:bg-gray-600' : 'bg-white text-indigo-600 hover:bg-indigo-50')
                )}
              >
                Unified
              </button>
              <button
                onClick={() => setGithubLayout('split')}
                className={clsx(
                  'border-l px-3 py-1.5 text-xs font-medium',
                  isDark ? 'border-indigo-700' : 'border-indigo-300',
                  githubLayout === 'split'
                    ? 'bg-indigo-600 text-white'
                    : (isDark ? 'bg-gray-700 text-indigo-400 hover:bg-gray-600' : 'bg-white text-indigo-600 hover:bg-indigo-50')
                )}
              >
                Split
              </button>
            </div>
          )}
          {needCompare && (
            <button
              onClick={() => {
                if (leftData && rightData) setIsComparing(true)
              }}
              disabled={!leftData || !rightData}
              className='flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <FaExchangeAlt size={12} /> Compare
            </button>
          )}

          {isComparing && needCompare && (
            <button
              onClick={() => setIsComparing(false)}
              className={clsx(
                'rounded-lg px-4 py-2 text-sm font-semibold',
                isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              )}
            >
              Clear Compare
            </button>
          )}
        </div>
      </div>

      {/* Content Area */}
      {showGithubView ? (
        /* ===== GitHub View ===== */
        <div className='flex-1 overflow-hidden p-4'>
          {githubLayout === 'unified' ? (
            <GithubUnifiedDiffView leftData={leftData} rightData={rightData} isDark={isDark} />
          ) : (
            <GithubSplitDiffView leftData={leftData} rightData={rightData} isDark={isDark} />
          )}
        </div>
      ) : needCompare == true ? (
        /* ===== Normal View / Input: Side-by-side tree panels with diff badges ===== */
        <div className='flex flex-1 gap-1 overflow-hidden p-1'>
          <div className='flex min-w-0 flex-1 flex-col'>
            <JsonPanel
              title='Left (Original)'
              text={leftText}
              setText={setLeftText}
              data={leftData}
              setData={setLeftData}
              error={leftError}
              onParse={parseLeft}
              diffMap={diffMap}
              accent='blue'
              isDark={isDark}
            />
          </div>
          <div className='flex min-w-0 flex-1 flex-col'>
            <JsonPanel
              title='Right (Modified)'
              text={rightText}
              setText={setRightText}
              data={rightData}
              setData={setRightData}
              error={rightError}
              onParse={parseRight}
              diffMap={diffMap}
              accent='emerald'
              isDark={isDark}
            />
          </div>
        </div>
      ) : (
        <div className='flex flex-1 gap-4 overflow-hidden p-1'>
          <div className='flex min-w-0 flex-1 flex-col'>
            <JsonPanel
              title='Left (Original)'
              text={leftText}
              setText={setLeftText}
              data={leftData}
              setData={setLeftData}
              error={leftError}
              onParse={parseLeft}
              diffMap={diffMap}
              accent='blue'
              isDark={isDark}
            />
          </div>
        </div>
      )}
    </div>
  )
}
