'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { DatePicker } from '@/components/DatePicker'

import { getBorderRadiusClass } from '@/app/utils/branding'
import { useInfoMsg } from '@/app/components/infoMsgHandler'
import { MdKeyboardArrowDown, MdSearch } from 'react-icons/md'
import { MdCheck } from 'react-icons/md'
import { MdClose } from 'react-icons/md'

// ─── Public types ─────────────────────────────────────────────────────────────

export type DataType = 'string' | 'number' | 'date'

export interface FieldConfig {
  controllerName: string
  dataType: DataType
  label?: string
}

export interface FilterOutput {
  key: string
  operator: string
  value: string | number
  value2?: string | number
}

export interface AdvancedSearchProps {
  data: FieldConfig[]
  value?: FilterOutput[]
  label?: string
  disabled?: boolean
  className?: string
  onChange?: (filters: FilterOutput[]) => void
  onSubmit?: (filters: FilterOutput[]) => void
}

// ─── Internal row ─────────────────────────────────────────────────────────────

interface FilterRow {
  id: string
  key: string
  operator: string
  value: string
  value2: string
  dataType: DataType
  selected: boolean
}

// ─── Dropdown option type ─────────────────────────────────────────────────────

interface DropdownOption {
  value: string
  label: string
}

// ─── DropdownSelect ───────────────────────────────────────────────────────────

interface DropdownSelectProps {
  options: DropdownOption[]
  value: string
  placeholder?: string
  disabled?: boolean
  isDark: boolean
  selectionColor: string
  onChange: (value: string) => void
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({
  options,
  value,
  placeholder = 'Select',
  disabled = false,
  isDark,
  selectionColor,
  onChange
}) => {
  const [open, setOpen] = useState(false)
  const [style, setStyle] = useState<React.CSSProperties>({})
  const btnRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  const openDropdown = () => {
    if (disabled || !btnRef.current) return
    const r = btnRef.current.getBoundingClientRect()
    setStyle({
      position: 'fixed',
      top: r.bottom + 4,
      left: r.left,
      width: Math.max(r.width, 160),
      zIndex: 9999
    })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (
        btnRef.current?.contains(e.target as Node) ||
        listRef.current?.contains(e.target as Node)
      )
        return
      setOpen(false)
    }
    const onScroll = (e: Event) => {
      if (listRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open])

  const borderColor = isDark ? '#4B5563' : '#D1D5DB'
  const bgBtn = isDark ? '#1F2937' : '#FFFFFF'
  const bgList = isDark ? '#1F2937' : '#FFFFFF'
  const textColor = isDark ? '#F9FAFB' : '#111827'
  const hoverBg = isDark ? '#374151' : '#F3F4F6'
  const placeholderCl = isDark ? '#6B7280' : '#9CA3AF'

  return (
    <>
      <button
        ref={btnRef}
        type='button'
        disabled={disabled}
        onClick={openDropdown}
        className='flex h-full w-full min-w-0 items-center justify-between gap-1 overflow-hidden rounded-lg px-2 text-xs focus:outline-none sm:px-3 sm:text-sm'
        style={{
          background: bgBtn,
          color: selected ? textColor : placeholderCl,
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'pointer',
          border: 'none'
        }}
      >
          <span className='min-w-0 flex-1 truncate text-left' style={{ fontFamily: 'var(--font-body)' }}>
            {selected ? selected.label : placeholder}
          </span>
        <MdKeyboardArrowDown
          size={16}
          className={`flex-shrink-0 transition-transform duration-150 ${
            open ? 'rotate-180' : ''
          }`}
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        />
      </button>

      {open && (
        <div
          ref={listRef}
          style={{
            ...style,
            background: bgList,
            border: `1px solid ${borderColor}`
          }}
          className='max-h-52 overflow-y-auto rounded-lg shadow-xl'
        >
          {options.length === 0 ? (
            <div
              className='px-3 py-2 text-center text-xs'
              style={{ color: placeholderCl, fontFamily: 'var(--font-body)' }}
            >
              No options
            </div>
          ) : (
            options.map(opt => {
              const isActive = opt.value === value
              return (
                <button
                  key={opt.value}
                  type='button'
                  onClick={() => {
                    onChange(opt.value)
                    setOpen(false)
                  }}
                  className='flex w-full min-w-0 items-center justify-between overflow-hidden px-3 py-1.5 text-left text-xs transition-colors duration-100 focus:outline-none sm:py-2 sm:text-sm'
                  style={{
                    background: isActive ? selectionColor : 'transparent',
                    color: isActive ? '#fff' : textColor
                  }}
                  onMouseEnter={e => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        hoverBg
                  }}
                  onMouseLeave={e => {
                    if (!isActive)
                      (e.currentTarget as HTMLElement).style.background =
                        'transparent'
                  }}
                >
                  <span className='truncate' style={{ fontFamily: 'var(--font-body)' }}>{opt.label}</span>
                  {isActive && (
                    <MdCheck size={14} className='ml-1 flex-shrink-0' />
                  )}
                </button>
              )
            })
          )}
        </div>
      )}
    </>
  )
}

// ─── Filter option sets ───────────────────────────────────────────────────────

const STRING_FILTERS: DropdownOption[] = [
  { value: '=', label: 'Equals' },
  { value: 'LIKE', label: 'Contains' },
  { value: 'LIKE_START', label: 'Starts With' },
  { value: 'LIKE_END', label: 'Ends With' },
  { value: '!=', label: 'Not Equals' }
]

const NUMBER_FILTERS: DropdownOption[] = [
  { value: '=', label: 'Equals' },
  { value: '!=', label: 'Not Equals' },
  { value: '>', label: 'Greater Than' },
  { value: '<', label: 'Less Than' },
  { value: '>=', label: 'Greater Than or Equals' },
  { value: '<=', label: 'Less Than or Equals' },
  { value: 'BETWEEN', label: 'Between' }
]

const DATE_FILTERS: DropdownOption[] = [
  { value: '=', label: 'Equals' },
  { value: '<', label: 'Before' },
  { value: '>', label: 'After' },
  { value: '<=', label: 'Before or Equals' },
  { value: '>=', label: 'After or Equals' },
  { value: 'BETWEEN', label: 'Between' }
]

const FILTER_MAP: Record<DataType, DropdownOption[]> = {
  string: STRING_FILTERS,
  number: NUMBER_FILTERS,
  date: DATE_FILTERS
}

const DEFAULT_FILTER: Record<DataType, string> = {
  string: '=',
  number: '=',
  date: '='
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const toTimestamp = (dateStr: string) =>
  dateStr ? `${dateStr}T00:00:00.000Z` : ''

const toOutput = (rows: FilterRow[]): FilterOutput[] =>
  rows.map(({ id, value2, dataType, ...rest }) => ({
    ...rest,
    ...(rest.operator === 'BETWEEN' ? { value2 } : {})
  }))

// ─── Component ────────────────────────────────────────────────────────────────

export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  data,
  label,
  disabled = false,
  className = '',
  onChange,
  onSubmit
}) => {
  const { theme, branding } = useGlobal()
  const isDark = theme === 'dark' || theme === 'dark-hc'

  const [rows, setRows] = useState<FilterRow[]>([])

  useEffect(() => {
    setRows(
      data.map(field => ({
        id: field.controllerName,
        key: field.controllerName,
        dataType: field.dataType,
        operator: DEFAULT_FILTER[field.dataType],
        value: '',
        value2: '',
        selected: false
      }))
    )
  }, [data])

  const patch = (id: string, changes: Partial<FilterRow>) => {
    const next = rows.map(row => (row.id === id ? { ...row, ...changes } : row))
    setRows(next)
    onChange?.(toOutput(next.filter(r => r.selected)))
  }

  const showToast = useInfoMsg()

  const handleClear = () => {
    const cleared = rows.map(row => ({
      ...row,
      value: '',
      value2: '',
      selected: false,
      operator: DEFAULT_FILTER[row.dataType]
    }))
    setRows(cleared)
    onChange?.([])
    // onSubmit?.([])
  }

  const handleSearch = () => {
    const selected = rows.filter(r => r.selected)
    if (selected.length === 0) {
      showToast('Please select at least one column', 'danger')
      return
    }
    onSubmit?.(toOutput(selected))
  }

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16)
    const g = parseInt(hex?.slice(3, 5), 16)
    const b = parseInt(hex?.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }

  const borderRadiusClass = getBorderRadiusClass(branding.borderRadius)
  const borderColor = isDark ? '#4B5563' : '#D1D5DB'

  const cellCls = `flex items-center gap-1.5 w-full min-h-10 rounded-lg border-2`
  const cellClsDate = `flex items-center w-full min-h-10`
  const cellStyle = { borderColor }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div
      className={`flex h-full min-h-0 w-full flex-col border ${borderRadiusClass} ${
        isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'
      } ${className}`}
      style={{ fontFamily: 'var(--font-body)' }}
    >
      {/* ── Header ── */}
      <div
        className={`flex items-center justify-between border-b px-4 py-2.5 ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <span
          className={`text-sm font-semibold sm:text-base ${
            isDark ? 'text-gray-100' : 'text-gray-900'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {label}
        </span>
        <div className='flex items-center gap-1.5 sm:gap-2'>
          <button
            type='button'
            onClick={handleClear}
            className='flex h-8 w-8 cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 text-xs font-medium duration-150 sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm'
            style={{
              backgroundColor: 'transparent',
              borderColor: borderColor,
              color: isDark ? '#9CA3AF' : '#6B7280'
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? '#374151' : '#F3F4F6'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
            }}
          >
            <MdClose size={16} />
            <span className='hidden sm:inline' style={{ fontFamily: 'var(--font-body)' }}>Clear</span>
          </button>
          <button
            type='button'
            onClick={handleSearch}
            className='flex h-8 w-8 cursor-pointer items-center justify-center gap-1 rounded-lg border border-transparent text-xs font-medium text-white duration-150 sm:w-auto sm:px-3 sm:py-1.5 sm:text-sm'
            style={{
              backgroundColor: branding.selectionColor,
              boxShadow: `0 0 0 0px ${hexToRgba(branding.selectionColor, 0.2)}`
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.backgroundColor =
                branding.hoverColor
              ;(
                e.currentTarget as HTMLElement
              ).style.boxShadow = `0 0 0 3px ${hexToRgba(
                branding.selectionColor,
                0.2
              )}`
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.backgroundColor =
                branding.selectionColor
              ;(
                e.currentTarget as HTMLElement
              ).style.boxShadow = `0 0 0 0px ${hexToRgba(
                branding.selectionColor,
                0.2
              )}`
            }}
          >
            <MdSearch size={16} />
            <span className='hidden sm:inline' style={{ fontFamily: 'var(--font-body)' }}>Search</span>
          </button>
        </div>
      </div>

      {/* ── Filter rows ── */}
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto'>
        {rows.map((row, idx) => {
          const field = data.find(f => f.controllerName === row.key)!
          const isBetween = row.operator === 'BETWEEN'
          const isDate = row.dataType === 'date'
          const isNumber = row.dataType === 'number'
          const filterOpts = FILTER_MAP[row.dataType]

          const labelCls = `break-words whitespace-normal text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`

          return (
            <div
              key={row.key}
              className='grid grid-cols-1 items-stretch gap-2 px-4 py-2 transition-colors duration-150 md:grid-cols-[28px_1fr_1fr_2fr] md:px-5 md:py-3'
            >
              {/* Checkbox */}
              <div className='mt-3 hidden min-h-10 items-center md:flex'>
                <input
                  type='checkbox'
                  checked={row.selected}
                  onChange={() => patch(row.id, { selected: !row.selected })}
                  className='h-4 w-4 cursor-pointer rounded'
                  style={{ accentColor: branding.selectionColor }}
                />
              </div>

              {/* Field */}
              <div className='flex w-full min-w-0 flex-col gap-1 self-stretch'>
                <span className={labelCls} style={{ fontFamily: 'var(--font-body)' }}>Field</span>
                <div className={cellCls} style={cellStyle}>
                  <span className='whitespace-normal break-words px-3 ' style={{ fontFamily: 'var(--font-body)' }}>
                    {field.label ?? field.controllerName}
                  </span>
                </div>
              </div>

              {/* Condition */}
              <div className='flex w-full min-w-0 flex-col gap-1 self-stretch'>
                <span className={labelCls} style={{ fontFamily: 'var(--font-body)' }}>Condition</span>
                <div className={cellCls} style={cellStyle}>
                  <DropdownSelect
                    options={filterOpts}
                    value={row.operator}
                    placeholder='Condition'
                    disabled={!row.key}
                    isDark={isDark}
                    selectionColor={branding.selectionColor}
                    onChange={v =>
                      patch(row.id, { operator: v, value: '', value2: '' })
                    }
                  />
                </div>
              </div>

              {/* Value */}
              <div className='flex w-full min-w-0 flex-col gap-1 self-stretch'>
                <span className={labelCls} style={{ fontFamily: 'var(--font-body)' }}>Value</span>
                {isBetween ? (
                  <div className='flex items-stretch gap-1'>
                    <div
                      className={isDate ? cellClsDate : cellCls}
                      style={isDate ? undefined : cellStyle}
                    >
                      {isDate ? (
                        <DatePicker
                          value={row.value}
                          fillContainer
                          onChange={v =>
                            patch(row.id, { value: toTimestamp(v) })
                          }
                        />
                      ) : (
                        <input
                          type={isNumber ? 'number' : 'text'}
                          value={row.value}
                          placeholder='From'
                          disabled={disabled}
                          onChange={e =>
                            patch(row.id, { value: e.target.value })
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSearch()
                          }}
                          className={`h-full w-full border-0 bg-transparent px-2 focus:outline-none focus:ring-0  ${
                            isDark
                              ? 'text-white placeholder-gray-500'
                              : 'text-gray-900 placeholder-gray-400'
                          }`}
                          style={{ fontFamily: 'var(--font-body)' }}
                        />
                      )}
                    </div>
                    <span
                      className={`flex-shrink-0 ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}
                      style={{ fontFamily: 'var(--font-body)' }}
                    >
                      –
                    </span>
                    <div
                      className={isDate ? cellClsDate : cellCls}
                      style={isDate ? undefined : cellStyle}
                    >
                      {isDate ? (
                        <DatePicker
                          value={row.value2}
                          fillContainer
                          onChange={v =>
                            patch(row.id, { value2: toTimestamp(v) })
                          }
                        />
                      ) : (
                        <input
                          type={isNumber ? 'number' : 'text'}
                          value={row.value2}
                          placeholder='To'
                          disabled={disabled}
                          onChange={e =>
                            patch(row.id, { value2: e.target.value })
                          }
                          onKeyDown={e => {
                            if (e.key === 'Enter') handleSearch()
                          }}
                          className={`h-full w-full border-0 bg-transparent px-2 focus:outline-none focus:ring-0 ${
                            isDark
                              ? 'text-white placeholder-gray-500'
                              : 'text-gray-900 placeholder-gray-400'
                          }`}
                          style={{ fontFamily: 'var(--font-body)' }}
                        />
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    className={isDate ? cellClsDate : cellCls}
                    style={isDate ? undefined : cellStyle}
                  >
                    {isDate ? (
                      <DatePicker
                        value={row.value}
                        fillContainer
                        onChange={v => patch(row.id, { value: toTimestamp(v) })}
                      />
                    ) : (
                      <input
                        type={isNumber ? 'number' : 'text'}
                        value={row.value}
                        placeholder='Value'
                        disabled={disabled}
                        onChange={e => patch(row.id, { value: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleSearch()
                        }}
                        className={`h-full w-full border-0 bg-transparent px-2 focus:outline-none focus:ring-0 ${
                          isDark
                            ? 'text-white placeholder-gray-500'
                            : 'text-gray-900 placeholder-gray-400'
                        }`}
                        style={{ fontFamily: 'var(--font-body)' }}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default AdvancedSearch