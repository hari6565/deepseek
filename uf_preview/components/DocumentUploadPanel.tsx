'use client'
import React, { useEffect, useRef, useState } from 'react'
import { RxCross2, RxUpload } from 'react-icons/rx'
import * as MdIcons from 'react-icons/md'
import { useGlobal } from '@/context/GlobalContext'
import { useInfoMsg } from '@/app/components/infoMsgHandler'
import { HeaderPosition, TooltipProps as TooltipPropsType } from '@/types/global'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'

// ── Types ─────────────────────────────────────────────────────────────────────

type ContentAlign = "left" | "center" | "right";

type FilesType = {
  file: File
  url: string
}

type DocConfig = {
  id: string
  label: string
  icon: string
  accept: string[]
  multiple: boolean
}


type DocumentUploadPanelProps = {
  documentfields?: DocConfig[]
  onChange?: (files: UploadedFiles) => void
  className?: string
  title?: string
  subtitle?: string
  // ── match DocumentUploader's props ──
  DbType?: string // 'mongodb' | 'dfs'
  enableEncryption?: string
  fileNamingPreference?: 'use_system_generated_name' | 'use_original_name'
  singleSelect?: boolean
  headerText?: string
  headerPosition?: HeaderPosition
  tooltipProps?: TooltipPropsType
  needTooltip?: boolean
  fillContainer?: boolean
  contentAlign?: ContentAlign
}

// ── Icon resolver ─────────────────────────────────────────────────────────────
type UploadedFileItem = {
  docId: string
  file: File
  url: string
}

type UploadedFiles = UploadedFileItem[]
type MdIconComponent = React.ComponentType<{
  size?: number
  className?: string
}>

const resolveIcon = (iconName: string): MdIconComponent => {
  const icon = (MdIcons as Record<string, unknown>)[iconName]
  if (typeof icon === 'function') return icon as MdIconComponent
  return MdIcons.MdInsertDriveFile as MdIconComponent
}

// ── Accept normalizer ─────────────────────────────────────────────────────────

// Mirrors the full set of file types DocumentUploader.tsx recognizes (see its
// getFileIcon map), so a doc field configured with any of these keys behaves
// the same way DocumentUploader does for that type.
const ACCEPT_MAP: Record<string, string[]> = {
  image: [
    'image/*',
    '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.avif', '.jfif'
  ],
  pdf: ['.pdf', 'application/pdf'],
  doc: ['.doc', 'application/msword'],
  docx: [
    '.docx',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.doc',
    'application/msword'
  ],
  xls: ['.xls', 'application/vnd.ms-excel'],
  xlsx: [
    '.xlsx',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.xls',
    'application/vnd.ms-excel'
  ],
  ppt: ['.ppt', 'application/vnd.ms-powerpoint'],
  pptx: [
    '.pptx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.ppt',
    'application/vnd.ms-powerpoint'
  ],
  csv: ['.csv', 'text/csv'],
  json: ['.json', 'application/json'],
  txt: ['.txt', 'text/plain'],
  md: ['.md', 'text/markdown'],
  html: ['.html', '.htm', 'text/html'],
  css: ['.css', 'text/css'],
  scss: ['.scss', 'text/x-scss'],
  zip: ['.zip', 'application/zip', 'application/x-zip-compressed'],
  rar: ['.rar', 'application/vnd.rar', 'application/x-rar-compressed'],
  archive: [
    '.zip', 'application/zip', 'application/x-zip-compressed',
    '.rar', 'application/vnd.rar', 'application/x-rar-compressed',
    '.7z', 'application/x-7z-compressed'
  ],
  any: ['*/*'],
  video: ['video/*'],
  audio: ['audio/*']
}

const normalizeAccept = (values: string[]): string => {
  if (!values || values.length === 0) return '' // empty = no restriction, accept anything
  return Array.from(
    new Set(values.flatMap(v => ACCEPT_MAP[v.toLowerCase()] ?? [v]))
  ).join(',')
}

const isFileAccepted = (file: File, acceptTypes: string[]): boolean => {
  // No accept types configured for this doc field -> don't restrict, same as
  // DocumentUploader.tsx which has no type restriction by default.
  if (!acceptTypes || acceptTypes.length === 0) return true

  const resolved = acceptTypes.flatMap(v => ACCEPT_MAP[v.toLowerCase()] ?? [v])
  return resolved.some(type => {
    if (type === '*/*') return true
    if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type.toLowerCase())
    if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', ''))
    return file.type === type
  })
}

// ── Component ─────────────────────────────────────────────────────────────────

const DocumentUploadPanel = ({
  documentfields,
  onChange,
  className = '',
  title,
  subtitle,
  DbType,
  enableEncryption,
  fileNamingPreference = 'use_system_generated_name',
  singleSelect = false,
  headerText,
  headerPosition = 'top',
  tooltipProps,
  needTooltip = false,
  fillContainer = true,
  contentAlign = 'center'
}: DocumentUploadPanelProps) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFiles>([])
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})
  const isMounted = useRef(false)
  const { theme } = useGlobal()
  const isDark = theme === 'dark' || theme === 'dark-hc'
  const showToast = useInfoMsg()

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true
      return
    }
    onChange?.(uploadedFiles)
  }, [uploadedFiles])

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCardClick = (docId: string) => {
    inputRefs.current[docId]?.click()
  }

const handleFileChange = (
  docId: string,
  multiple: boolean,
  accept: string[],
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const all = Array.from(e.target.files || [])
  const selected = all.filter(f => isFileAccepted(f, accept))
  const rejected = all.filter(f => !isFileAccepted(f, accept))

  if (rejected.length > 0) {
    const acceptedLabel = accept.map(v => v.toUpperCase()).join(', ')
    showToast(`Invalid file type. Accepted formats: ${acceptedLabel}`, 'danger')
  }

  if (!selected.length) return

  const makeEntries = (file: File): UploadedFileItem => {
    const ext = file.name.split('.').pop() || ''
    const baseName = file.name.replace(`.${ext}`, '')
    const uniqueName =
      fileNamingPreference === 'use_system_generated_name'
        ? `${baseName}_${Date.now()}.${ext}`
        : file.name
    const renamedFile = new File([file], uniqueName, { type: file.type })
    Object.defineProperty(renamedFile, 'DbType', {
      value: DbType, writable: true, enumerable: true
    })
    Object.defineProperty(renamedFile, 'returnType', {
      value: singleSelect ? 'string' : 'string[]', writable: true, enumerable: true
    })
    Object.defineProperty(renamedFile, 'enableEncryption', {
      value: enableEncryption, writable: true, enumerable: true
    })
    return {
      docId,
      file: renamedFile,
      url: URL.createObjectURL(renamedFile)
    }
  }

  setUploadedFiles(prev => {
    const newEntries = selected.map(makeEntries)
    let next: UploadedFiles

    if (!multiple) {
      next = [
        ...prev.filter((item: any) => item.docId !== docId),
        newEntries[0]
      ]
    } else {
      const existing = prev.filter((item: any) => item.docId === docId)
      const existingKeys = new Set(
        existing.map((f: any) => `${f.file.name}-${f.file.size}`)
      )
      const deduped = newEntries.filter(
        (f: any) => !existingKeys.has(`${f.file.name}-${f.file.size}`)
      )
      next = [...prev, ...deduped]
    }

    return next
  })

  e.target.value = ''
}

const handleRemoveFile = (
  docId: string,
  fileIndex: number,
  e: React.MouseEvent
) => {
  e.stopPropagation()

  setUploadedFiles(prev => {
    const filesForDoc = prev.filter(item => item.docId === docId)
    if (!filesForDoc[fileIndex]) return prev

    URL.revokeObjectURL(filesForDoc[fileIndex].url)

    let currentIndex = -1
    const next = prev.filter(item => {
      if (item.docId !== docId) return true
      currentIndex++
      return currentIndex !== fileIndex
    })

    return next
  })
}

  // ── Styles ──────────────────────────────────────────────────────────────────

  const panelBg = isDark
    ? 'bg-gray-900 text-gray-100'
    : 'bg-white text-gray-800'
  const cardIdle = isDark
    ? 'border-gray-600 bg-gray-800/50 hover:border-red-500 hover:bg-gray-800/80'
    : 'border-gray-300 bg-gray-50 hover:border-red-400 hover:bg-red-50/20'
  const cardFilled = isDark
    ? 'border-red-600/60 bg-gray-800'
    : 'border-red-300 bg-red-50/30'

  const getFillClasses = () => {
    if (!fillContainer) return ''
    return 'w-full h-full'
  }

  const getContentAlignClasses = () => {
    switch (contentAlign) {
      case 'left':
        return 'justify-start'
      case 'right':
        return 'justify-end'
      case 'center':
      default:
        return 'justify-center'
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const panelElement = (
    <div
      className={`flex flex-col gap-6 rounded-xl p-6 shadow-md ${panelBg} ${getFillClasses()} ${className}`}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className='flex flex-col gap-1'>
          {title && (
            <h2
              className={`text-base font-semibold ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}
            >
              {title}
            </h2>
          )}
          {subtitle && (
            <p
              className={`text-xs ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}

      {/* Card grid: single field fills the panel, multiple fields wrap into 2 columns */}
      <div
        className={`
          grid flex-1 auto-rows-fr gap-4 min-h-0
          ${(documentfields?.length ?? 0) > 1 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1'}
          ${getContentAlignClasses()}
        `}
      >
        {documentfields?.map(doc => {
          const IconComp = resolveIcon(doc.icon)
          const files = uploadedFiles.filter(item => item.docId === doc.id)
          const hasFiles = files.length > 0

          return (
            <div key={doc.id} className='h-full'>
              {/* Hidden file input */}
              <input
                ref={el => {
                  inputRefs.current[doc.id] = el
                }}
                type='file'
                accept={normalizeAccept(doc.accept)}
                multiple={doc.multiple}
                className='hidden'
                onChange={e => handleFileChange(doc.id, doc.multiple, doc.accept, e)}
              />

              {/* Card */}
              <div
                className={`
                  flex h-full min-h-[150px] cursor-pointer flex-col overflow-hidden rounded-lg
                  border-2 border-dashed transition-all duration-200
                  ${hasFiles ? cardFilled : cardIdle}
                `}
                onClick={() => !hasFiles && handleCardClick(doc.id)}
              >
                {!hasFiles ? (
                  /* ── Empty state ── */
                  <div className='flex h-full flex-col items-center justify-center gap-2 p-5 text-center'>
                    <div
                      className={`rounded-full p-3 ${
                        isDark ? 'bg-gray-700' : 'bg-gray-200'
                      }`}
                    >
                      <IconComp
                        size={24}
                        className={isDark ? 'text-gray-300' : 'text-gray-500'}
                      />
                    </div>
                    <span
                      className={`text-sm font-medium leading-tight ${
                        isDark ? 'text-gray-300' : 'text-gray-600'
                      }`}
                    >
                      {doc.label}
                    </span>
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        isDark ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      <RxUpload size={11} />
                      <span>Click to upload</span>
                    </div>
                  </div>
                ) : (
                  /* ── Filled state ── */
                  <div
                    className='flex flex-col gap-2 p-3'
                    onClick={e => e.stopPropagation()}
                  >
                    {/* Card header row */}
                    <div className='flex items-center justify-between gap-2'>
                      <div className='flex min-w-0 items-center gap-1.5'>
                        <IconComp
                          size={14}
                          className='flex-shrink-0 text-red-500'
                        />
                        <span
                          className={`truncate text-xs font-medium ${
                            isDark ? 'text-gray-300' : 'text-gray-600'
                          }`}
                        >
                          {doc.label}
                        </span>
                      </div>
                      {doc.multiple && (
                        <button
                          className='flex-shrink-0 whitespace-nowrap text-xs font-medium text-red-500 hover:text-red-600'
                          onClick={e => {
                            e.stopPropagation()
                            handleCardClick(doc.id)
                          }}
                        >
                          + Add
                        </button>
                      )}
                    </div>

                    {/* File list */}
                    <div className='flex flex-col gap-1.5'>
                      {files.map((item, i) => (
                        <div
                          key={`${item.file.name}-${i}`}
                          className={`
                            flex items-center justify-between gap-2
                            rounded-md px-2.5 py-1.5 text-xs
                            ${
                              isDark
                                ? 'border border-gray-600 bg-gray-700'
                                : 'border border-gray-200 bg-white shadow-sm'
                            }
                          `}
                        >
                          <span
                            className={`min-w-0 flex-1 truncate ${
                              isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}
                          >
                            {item.file.name}
                          </span>
                          <button
                            className={`
                              flex-shrink-0 rounded-full p-0.5 transition-colors
                              ${
                                isDark
                                  ? 'text-red-400 hover:bg-red-900/30 hover:text-red-300'
                                  : 'text-red-400 hover:bg-red-50 hover:text-red-600'
                              }
                            `}
                            onClick={e => handleRemoveFile(doc.id, i, e)}
                          >
                            <RxCross2 size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )

  return (
    <CommonHeaderAndTooltip
      needTooltip={needTooltip}
      tooltipProps={tooltipProps}
      headerText={headerText}
      headerPosition={headerPosition}
      className={className}
      fillContainer={fillContainer}
    >
      {panelElement}
    </CommonHeaderAndTooltip>
  )
}

export default DocumentUploadPanel