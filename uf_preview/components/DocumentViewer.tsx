'use client'

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { CSSProperties } from 'react'
import {
  MdZoomIn,
  MdRefresh,
  MdZoomOut,
  MdInfoOutline,
  MdOutlineSkipPrevious,
  MdKeyboardBackspace,
  MdOutlineSkipNext,
  MdExpandMore,
  MdCheck,
  MdFirstPage,
  MdLastPage,
  MdNavigateBefore,
  MdNavigateNext
} from 'react-icons/md'
import { RiDeleteBinLine } from 'react-icons/ri'
import { useGlobal } from '@/context/GlobalContext'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import * as mammoth from 'mammoth'
import * as XLSX from '@e965/xlsx'
// import * as UTIF from 'utif2'
let UTIF:any={}
import Image from 'next/image'
import DOMPurify from 'dompurify'
import { ConfirmModal } from './ConfirmModal'
import DocumentInformation, {
  DocumentDetail,
  UploadStatus,
  formatBytes
} from './DocumentInformation'

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

export type AttachmentAdditionalData = {
  attachment_id?: number | string | null
  reference_id?: string | number | null
  reference_type?: string | null
  category?: string | null
  doc_type?: string | null
  doc_group?: string | null
  doc_name?: string | null
  url?: string | null
  doc_size?: number | null
  trs_created_date?: string | null
  trs_created_by?: string | null
  trs_modified_date?: string | null
  trs_modified_by?: string | null
  [key: string]: unknown
}

export type FileItem = {
  url: string
  fileName: string
  fileType: string
  originalId?: string
  /** Raw metadata for this attachment — powers the Document Information modal */
  additionalData?: AttachmentAdditionalData
  /** Upload state, when the viewer is shown while an upload is still running */
  uploadStatus?: UploadStatus
  uploadedBytes?: number
  /** Scanner image type, already resolved to a label (TiffFront, JpegBack, …).
   *  A CHEQUE scan returns the same cheque several times over, so every image
   *  shares one extension and the type filter has to group by this instead. */
  imageType?: string,
  __allDoc?:any[]
}

type toolbarPosition = 'top' | 'bottom' | 'left' | 'right'
type toolbarAlignment = 'start' | 'center' | 'end'

interface DocViewerProps {
  files?: FileItem[]
  className?: string
  scanType?: string
  style?: CSSProperties
  headerText?: string
  headerPosition?: HeaderPosition
  toolbarPosition?: toolbarPosition
  toolbarAlignment?: toolbarAlignment
  tooltipProps?: TooltipPropsType
  needTooltip?: boolean
  onDownload?: (file: FileItem) => void
  currentUrlIndex?: number
  onUrlIndexChange?: (index: number) => void
  onSelectIndex?: (index: number) => void
  /* Asked before every move the toolbar makes, with the index the viewer is
   * about to show. Returning false - or a promise of it - keeps the current
   * document on screen, so the owner can refuse the move while its form is
   * still invalid. Without it navigation behaves as before. */
  beforeNavigate?: (nextIndex?: number) => boolean | Promise<boolean>
  /* A CHEQUE scan groups its images into transactions and only the current
   * transaction's images are loaded, so the skip buttons step between
   * transactions instead of jumping to the first/last image. The owner holds the
   * queue and supplies these; without them the buttons keep their normal meaning. */
  onPreviousTransaction?: () => void
  onNextTransaction?: () => void
  hasPreviousTransaction?: boolean
  hasNextTransaction?: boolean
  needDocumentInfo?: boolean
  /* The viewer never owns the file list, so it cannot remove anything itself.
   * The delete button appears only when `onDelete` is supplied, and all it does
   * is report the file the user asked to remove; the owner drops it from the
   * list and the shorter `files` flows back in. */
  onDelete?: (file: FileItem, index: number) => void | Promise<void>
  /** Shows the delete button. Off hides it even when `onDelete` is supplied. */
  needDelete?: boolean
  /** Ask before handing the delete to the owner. Off only when it confirms. */
  needDeleteConfirm?: boolean
  deleteConfirmTitle?: string
  deleteConfirmContent?: string
  docSizeUnit?: 'B' | 'KB' | 'MB'
  onDocumentInfoOpen?: (file: FileItem, index: number) => void
  getDocumentDetails?: (file: FileItem) => DocumentDetail[]
}

/* ---------- helpers ---------- */
const isImage = (url?: string) =>
  !!url && /\.(png|jpe?g|gif|webp|bmp|svg|jfif)$/i.test(url)
const isPdf = (url?: string) => !!url && /\.pdf$/i.test(url)
const isOffice = (url?: string) => !!url && /\.(docx?|xlsx?|pptx?)$/i.test(url)
const isImageType = (type?: string) => !!type && type.startsWith('image/')
const isPdfType = (type?: string) => type === 'application/pdf'
const isWordType = (type?: string) =>
  !!type &&
  (type === 'application/msword' ||
    type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
const isWordUrl = (url?: string) => !!url && /\.docx?$/i.test(url)
const isExcelType = (type?: string) =>
  !!type &&
  (type === 'application/vnd.ms-excel' ||
    type ===
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
const isExcelUrl = (url?: string) => !!url && /\.xlsx?$/i.test(url)

const isCsvType = (type?: string) =>
  !!type &&
  (type === 'text/csv' ||
    type === 'application/csv' ||
    type === 'text/comma-separated-values')

const isCsvUrl = (url?: string) => !!url && /\.csv$/i.test(url)

/* TIFF: not rendered natively by most browsers, so it is decoded manually */
const isTiffType = (type?: string) =>
  !!type &&
  (type === 'image/tiff' || type === 'image/tif' || type === 'image/x-tiff')

const isTiffUrl = (url?: string) => !!url && /\.tiff?($|[?#])/i.test(url)

/* UV: scanner UV capture. The extension and MIME type (octet-stream) say
 * nothing about the real format, so the content is sniffed from its magic bytes. */
const isUvName = (name?: string) => !!name && /\.uv($|[?#])/i.test(name)

type SniffedImage = { kind: 'tiff' | 'image'; mime: string }

/** Identify an image by its magic bytes (extension/MIME are unreliable for .uv) */
const sniffImage = (b: Uint8Array): SniffedImage | null => {
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff)
    return { kind: 'image', mime: 'image/jpeg' }
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47)
    return { kind: 'image', mime: 'image/png' }
  if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46)
    return { kind: 'image', mime: 'image/gif' }
  if (b[0] === 0x42 && b[1] === 0x4d)
    return { kind: 'image', mime: 'image/bmp' }
  if (
    (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) ||
    (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a)
  )
    return { kind: 'tiff', mime: 'image/tiff' }
  return null
}

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

/* utif2's shipped typings only declare a 2-arg decodeImage, but the runtime
 * accepts the rest of the page list as a third argument, which multi-page TIFFs
 * need in order to resolve chained directories. */
const decodeTiffImage = UTIF.decodeImage as (
  buffer: ArrayBuffer,
  ifd: UTIF.IFD,
  ifds: UTIF.IFD[]
) => void

/** "2026-09-16T04:48:08.000Z" -> "16 Sep 2026, 10:18 AM" (viewer's local time) */
const formatDateTime = (value?: string | null): string => {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const hours24 = date.getHours()
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const meridiem = hours24 < 12 ? 'AM' : 'PM'
  return `${String(date.getDate()).padStart(2, '0')} ${
    MONTHS[date.getMonth()]
  } ${date.getFullYear()}, ${hours12}:${minutes} ${meridiem}`
}

/** "image/jpeg" -> "JPEG"; falls back to the filename extension */
const prettyFileType = (fileType?: string, fileName?: string): string => {
  const ext = fileName?.split('.').pop()?.toLowerCase()

  if (ext) {
    if (ext === 'jpeg' || ext === 'jpg') return 'JPG'
    if (ext === 'tif' || ext === 'tiff') return 'TIFF'
    if (ext.length <= 5) return ext.toUpperCase()
  }

  const subtype = fileType?.split('/')[1]

  if (subtype) {
    const cleaned = subtype.split('.').pop()?.toLowerCase() || subtype

    if (cleaned === 'jpeg' || cleaned === 'jpg') return 'JPG'
    if (cleaned === 'tif' || cleaned === 'tiff' || cleaned === 'x-tiff')
      return 'TIFF'
    if (cleaned.length <= 5) return cleaned.toUpperCase()
  }

  return ext ? ext.toUpperCase() : '—'
}

const emptyToDash = (value?: string | number | null): string =>
  value === null || value === undefined || value === '' ? '—' : String(value)

/* ---------- component ---------- */
const DocViewer: React.FC<DocViewerProps> = ({
  files = [],
  className = '',
  scanType,
  style,
  headerText,
  headerPosition = 'top',
  toolbarPosition = 'top',
  toolbarAlignment = 'end',
  tooltipProps,
  needTooltip = false,
  onDownload,
  currentUrlIndex,
  onUrlIndexChange,
  onSelectIndex,
  beforeNavigate,
  onPreviousTransaction,
  onNextTransaction,
  hasPreviousTransaction = false,
  hasNextTransaction = false,
  needDocumentInfo = true,
  onDelete,
  needDelete = false,
  needDeleteConfirm = true,
  deleteConfirmTitle = 'Delete document',
  deleteConfirmContent = 'This document will be removed from the list. Do you want to continue?',
  docSizeUnit = 'KB',
  onDocumentInfoOpen,
  getDocumentDetails
}) => {
  const { theme } = useGlobal()

  /* ---------- File Type Filter Logic ---------- */
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  /* What the type filter groups by. A CHEQUE scan returns the same cheque once
   * per scanner image type, so grouping by extension would collapse four
   * distinct images into one or two useless buckets — it groups by the resolved
   * image type (TiffFront, TiffBack, JpegFront, JpegBack, UVFront) instead.
   * Any file without one falls back to the extension, so a mixed list still works. */
  const filterLabelOf = useCallback(
    (file: FileItem) =>
      scanType === 'CHEQUE' && file?.imageType
        ? file.imageType
        : prettyFileType(file?.fileType, file?.fileName),
    [scanType]
  )

  const filterTypeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: files.length
    }

    files.forEach(f => {
      const type = filterLabelOf(f)

      if (type && type !== '—') {
        counts[type] = (counts[type] || 0) + 1
      }
    })

    return counts
  }, [files, filterLabelOf])

  const filterOptions = useMemo(
    () => Object.keys(filterTypeCounts),
    [filterTypeCounts]
  )

  const filteredFiles = useMemo(() => {
    if (!selectedTypeFilter || selectedTypeFilter === 'ALL') {
      return files
    }

    return files.filter(
      f => filterLabelOf(f).toUpperCase() === selectedTypeFilter.toUpperCase()
    )
  }, [files, selectedTypeFilter, filterLabelOf])

  const [filteredIndex, setFilteredIndex] = useState(0)

  useEffect(() => {
    if (currentUrlIndex !== undefined && files[currentUrlIndex]) {
      const targetFile = files[currentUrlIndex]

      const idxInFiltered = filteredFiles.indexOf(targetFile)

      if (idxInFiltered !== -1) {
        setFilteredIndex(idxInFiltered)
      }
    }
  }, [currentUrlIndex, files, filteredFiles])

  const activeFilteredIndex = Math.min(
    Math.max(0, filteredIndex),
    Math.max(0, filteredFiles.length - 1)
  )

  const currentFile = filteredFiles[activeFilteredIndex]
  const currentUrl = currentFile?.url
  const currentFileName = currentFile?.fileName || 'Document'
  const currentFileType = currentFile?.fileType || ''

  const isFirst = activeFilteredIndex === 0
  const isLast = activeFilteredIndex >= filteredFiles.length - 1

  const originalIndex = currentFile ? files.indexOf(currentFile) : -1

  const onSelectIndexRef = useRef(onSelectIndex)

  useEffect(() => {
    onSelectIndexRef.current = onSelectIndex
  })

  useEffect(() => {
    if (files.length === 0 || originalIndex === -1) {
      return
    }

    onSelectIndexRef.current?.(originalIndex)
  }, [originalIndex, files.length])

  const [numPages, setNumPages] = useState<number>(0)
  const [pdfPageNumber, setPdfPageNumber] = useState(1)
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)

  /* ---------- document information modal ---------- */
  const [isInfoOpen, setIsInfoOpen] = useState(false)
  const [infoAnchor, setInfoAnchor] = useState<DOMRect | null>(null)

  /* ---------- delete ---------- */
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  /* ---------- dropdown ---------- */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  /* ---------- reset ---------- */
  const resetZoomAndPosition = useCallback(() => {
    setZoom(1)

    setPosition({
      x: 0,
      y: 0
    })
  }, [])

  useEffect(() => {
    setNumPages(0)
    setPdfPageNumber(1)
    setIsInfoOpen(false)
    setInfoAnchor(null)
  }, [currentUrl])

  /* ---------- navigation ---------- */
  /* The guard may be slow, so hold the move until it answers and ignore the
   * clicks that land while it is still running. */
  const isGuardRunningRef = useRef(false)

  const allowNavigation = async (nextIndex?: number) => {
    if (beforeNavigate === undefined) {
      return true
    }

    if (isGuardRunningRef.current) {
      return false
    }

    isGuardRunningRef.current = true

    try {
      return (await beforeNavigate(nextIndex)) !== false
    } finally {
      isGuardRunningRef.current = false
    }
  }

  const navigateFiltered = async (newFilteredIdx: number) => {
    const targetFile = filteredFiles[newFilteredIdx]
    const originalIdx = targetFile ? files.indexOf(targetFile) : -1

    if (!(await allowNavigation(originalIdx === -1 ? undefined : originalIdx))) {
      return
    }

    setFilteredIndex(newFilteredIdx)
    resetZoomAndPosition()

    if (targetFile && onUrlIndexChange !== undefined && originalIdx !== -1) {
      onUrlIndexChange(originalIdx)
    }
  }

  const handleSelectFilter = (filter: string) => {
    setSelectedTypeFilter(filter)
    setIsDropdownOpen(false)

    const nextFiltered =
      filter === 'ALL'
        ? files
        : files.filter(
            f => filterLabelOf(f).toUpperCase() === filter.toUpperCase()
          )

    const existingIndex = nextFiltered.indexOf(currentFile)

    if (existingIndex !== -1) {
      setFilteredIndex(existingIndex)
      return
    }

    const previousOriginalIdx = originalIndex

    setFilteredIndex(0)
    resetZoomAndPosition()

    const targetOriginalIdx = nextFiltered[0]
      ? files.indexOf(nextFiltered[0])
      : -1

    if (
      onUrlIndexChange !== undefined &&
      targetOriginalIdx !== -1 &&
      targetOriginalIdx !== previousOriginalIdx
    ) {
      onUrlIndexChange(targetOriginalIdx)
    }
  }

  /* Transaction mode: only taken for a CHEQUE scan whose owner actually supplied
   * the queue handlers. Prev/Next keep stepping through the images of the
   * transaction on screen; only the two skip buttons change meaning. */
  const isTransactionNav =
    scanType === 'CHEQUE' && (!!onPreviousTransaction || !!onNextTransaction)

  const goToFirst = async () => {
    if (isTransactionNav) {
      if (hasPreviousTransaction && (await allowNavigation())) {
        onPreviousTransaction?.()
      }
      return
    }

    if (!isFirst) {
      await navigateFiltered(0)
    }
  }

  const goToPrevious = async () => {
    if (!isFirst) {
      await navigateFiltered(activeFilteredIndex - 1)
    }
  }

  const goToNext = async () => {
    if (!isLast) {
      await navigateFiltered(activeFilteredIndex + 1)
    }
  }

  const goToLast = async () => {
    if (isTransactionNav) {
      if (hasNextTransaction && (await allowNavigation())) {
        onNextTransaction?.()
      }
      return
    }

    if (!isLast && filteredFiles.length > 0) {
      await navigateFiltered(filteredFiles.length - 1)
    }
  }

  const skipBackLabel = isTransactionNav
    ? 'Previous transaction'
    : 'First document'

  const skipForwardLabel = isTransactionNav
    ? 'Next transaction'
    : 'Last document'

  const skipBackDisabled = isTransactionNav
    ? !hasPreviousTransaction
    : isFirst || filteredFiles.length === 0

  const skipForwardDisabled = isTransactionNav
    ? !hasNextTransaction
    : isLast || filteredFiles.length === 0

  /* ---------- zoom ---------- */
  const handleZoomIn = () =>
    setZoom(prev => Math.min(Number((prev + 0.25).toFixed(2)), 4))

  const handleZoomOut = () =>
    setZoom(prev => Math.max(Number((prev - 0.25).toFixed(2)), 1))

  const handleResetZoom = () => resetZoomAndPosition()

  /* ---------- Word Document Processing ---------- */
  const isWordDoc =
    isWordType(currentFileType) ||
    isWordUrl(currentUrl) ||
    isWordUrl(currentFileName)
  const [wordHtml, setWordHtml] = useState('')
  const [wordLoading, setWordLoading] = useState(false)
  const [wordError, setWordError] = useState('')

  useEffect(() => {
    if (!isWordDoc || !currentUrl) {
      setWordHtml('')
      setWordError('')
      return
    }
    let cancelled = false
    setWordLoading(true)
    setWordError('')
    fetch(currentUrl)
      .then(res => res.arrayBuffer())
      .then(arrayBuffer => mammoth.convertToHtml({ arrayBuffer }))
      .then(result => {
        // mammoth converts docx markup structurally but does not sanitize it —
        // a crafted upload (e.g. an image with an onerror handler) would
        // otherwise execute as stored XSS for anyone who views this document.
        if (!cancelled) setWordHtml(DOMPurify.sanitize(result.value))
      })
      .catch(() => {
        if (!cancelled) setWordError('Failed to render document.')
      })
      .finally(() => {
        if (!cancelled) setWordLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isWordDoc, currentUrl])

  /* ---------- Excel / CSV Processing ---------- */
  const isCsvDoc =
    isCsvType(currentFileType) ||
    isCsvUrl(currentUrl) ||
    isCsvUrl(currentFileName)

  const isExcelDoc =
    isExcelType(currentFileType) ||
    isExcelUrl(currentUrl) ||
    isExcelUrl(currentFileName) ||
    isCsvDoc

  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null)
  const [activeSheet, setActiveSheet] = useState('')
  const [excelLoading, setExcelLoading] = useState(false)
  const [excelError, setExcelError] = useState('')

  useEffect(() => {
    if (!isExcelDoc || !currentUrl) {
      setWorkbook(null)
      setActiveSheet('')
      setExcelError('')
      return
    }
    let cancelled = false
    setExcelLoading(true)
    setExcelError('')

    const load = () =>
      isCsvDoc
        ? fetch(currentUrl).then(res => res.text())
        : fetch(currentUrl).then(res => res.arrayBuffer())

    load()
      .then(data => {
        const wb = isCsvDoc
          ? XLSX.read(data as string, {
              type: 'string'
            })
          : XLSX.read(data as ArrayBuffer, {
              type: 'array'
            })

        if (!cancelled) {
          setWorkbook(wb)
          setActiveSheet(wb.SheetNames[0] || '')
        }
      })
      .catch(() => {
        if (!cancelled) setExcelError('Failed to render spreadsheet.')
      })
      .finally(() => {
        if (!cancelled) setExcelLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [isExcelDoc, isCsvDoc, currentUrl])

  const MAX_ROWS_PER_SHEET_PAGE = 200
  const [sheetRowPage, setSheetRowPage] = useState(0)

  useEffect(() => {
    setSheetRowPage(0)
  }, [workbook, activeSheet])

  const sheetPageData = useMemo(() => {
    const ws = workbook?.Sheets[activeSheet]

    if (!ws || !activeSheet) {
      return {
        html: '',
        pageCount: 0,
        startRow: 0,
        endRow: 0,
        totalRows: 0
      }
    }

    const allRows = XLSX.utils.sheet_to_json(ws, {
      header: 1
    }) as unknown[][]

    const totalRows = allRows.length

    const pageCount = Math.max(
      1,
      Math.ceil(totalRows / MAX_ROWS_PER_SHEET_PAGE)
    )

    const pageIndex = Math.min(sheetRowPage, pageCount - 1)

    const start = pageIndex * MAX_ROWS_PER_SHEET_PAGE

    const pageRows = allRows.slice(start, start + MAX_ROWS_PER_SHEET_PAGE)

    const html = pageRows.length
      ? DOMPurify.sanitize(
          XLSX.utils.sheet_to_html(XLSX.utils.aoa_to_sheet(pageRows), {
            header: '',
            footer: ''
          })
        )
      : ''

    return {
      html,
      pageCount,
      startRow: start,
      endRow: start + pageRows.length,
      totalRows
    }
  }, [workbook, activeSheet, sheetRowPage])

  /* ---------- .uv (scanner UV image) detection ---------- */
  const isUvDoc = isUvName(currentFileName) || isUvName(currentUrl)
  const [uvFormat, setUvFormat] = useState<
    '' | 'loading' | 'tiff' | 'image' | 'text' | 'unknown'
  >('')
  const [uvImageUrl, setUvImageUrl] = useState('')
  const [uvText, setUvText] = useState('')

  useEffect(() => {
    setUvImageUrl('')
    setUvText('')
    if (!isUvDoc || !currentUrl) {
      setUvFormat('')
      return
    }

    let cancelled = false
    let objectUrl = ''
    setUvFormat('loading')

    fetch(currentUrl)
      .then(res => res.blob())
      .then(async blob => {
        const head = new Uint8Array(await blob.slice(0, 16).arrayBuffer())
        if (cancelled) return

        const found = sniffImage(head)
        if (!found) {
          // not an image: if it is readable text (e.g. JSON), show it as text
          const raw = await blob.slice(0, 1024 * 1024).text()
          if (cancelled) return

          const looksBinary = /[\u0000-\u0008\u000E-\u001F\uFFFD]/.test(
            raw.slice(0, 4096)
          )

          if (looksBinary || !raw.trim()) {
            setUvFormat('unknown')
            return
          }

          let pretty = raw
          try {
            pretty = JSON.stringify(JSON.parse(raw), null, 2)
          } catch {
            // not valid JSON (or truncated): show the raw text as-is
          }

          setUvText(pretty)
          setUvFormat('text')
          return
        }

        if (found.kind === 'image') {
          // re-wrap with the real MIME type so <img> never depends on octet-stream
          objectUrl = URL.createObjectURL(blob.slice(0, blob.size, found.mime))
          setUvImageUrl(objectUrl)
        }
        setUvFormat(found.kind)
      })
      .catch(() => {
        if (!cancelled) setUvFormat('unknown')
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [isUvDoc, currentUrl])

  /* ---------- TIFF Processing ---------- */
  // Reuses numPages / pdfPageNumber for multi-page navigation
  const isTiffDoc =
    isTiffType(currentFileType) ||
    isTiffUrl(currentUrl) ||
    isTiffUrl(currentFileName) ||
    (isUvDoc && uvFormat === 'tiff')

  const tiffRef = useRef<{ buffer: ArrayBuffer; pages: UTIF.IFD[] } | null>(
    null
  )
  const [tiffImageUrl, setTiffImageUrl] = useState('')
  const [tiffError, setTiffError] = useState('')

  // Fetch once and read the page list
  useEffect(() => {
    tiffRef.current = null
    setTiffImageUrl('')
    setTiffError('')
    if (!isTiffDoc || !currentUrl) return

    let cancelled = false
    fetch(currentUrl)
      .then(res => res.arrayBuffer())
      .then(buffer => {
        const pages = UTIF.decode(buffer).filter(
          ifd => ifd['t256'] !== undefined && ifd['t257'] !== undefined
        )
        if (!pages.length) throw new Error('Empty TIFF')
        if (!cancelled) {
          tiffRef.current = { buffer, pages }
          setNumPages(pages.length)
        }
      })
      .catch(() => {
        if (!cancelled) setTiffError('Failed to render TIFF image.')
      })
    return () => {
      cancelled = true
    }
  }, [isTiffDoc, currentUrl])

  // Decode only the current page into a PNG data URL
  useEffect(() => {
    const tiff = tiffRef.current
    const ifd = tiff?.pages[pdfPageNumber - 1]
    if (!isTiffDoc || !tiff || !ifd) return

    try {
      decodeTiffImage(tiff.buffer, ifd, tiff.pages)
      const width = Number(ifd.width)
      const height = Number(ifd.height)
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas
        .getContext('2d')
        ?.putImageData(
          new ImageData(new Uint8ClampedArray(UTIF.toRGBA8(ifd)), width, height),
          0,
          0
        )
      setTiffImageUrl(canvas.toDataURL())
    } catch {
      setTiffError('Failed to render TIFF page.')
    }
  }, [isTiffDoc, numPages, pdfPageNumber])

  /* ---------- Pan & Zoom ---------- */
  useEffect(() => {
    const element = contentRef.current
    if (!element) return
    const handleWheelEvent = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()

        const delta = e.deltaY > 0 ? -0.25 : 0.25

        setZoom(prev => Math.min(Math.max(prev + delta, 1), 4))
      } else if (zoom > 1) {
        e.preventDefault()
        e.stopPropagation()
        if (e.shiftKey) {
          setPosition(prev => ({
            x: prev.x - (e.deltaY > 0 ? 20 : -20),
            y: prev.y
          }))
        } else {
          setPosition(prev => ({
            x: prev.x,
            y: prev.y - (e.deltaY > 0 ? 20 : -20)
          }))
        }
      }
    }
    element.addEventListener('wheel', handleWheelEvent, {
      passive: false
    })
    return () => element.removeEventListener('wheel', handleWheelEvent)
  }, [zoom])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true)

        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y
        })
      }
    },
    [zoom, position]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y
        })
      }
    },
    [isDragging, dragStart, zoom]
  )

  const handleMouseUp = useCallback(() => setIsDragging(false), [])

  const handleMouseLeave = useCallback(() => setIsDragging(false), [])

  const panHandlers = {
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: handleMouseUp,
    onMouseLeave: handleMouseLeave
  }

  const transformStyle = {
    transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
    transformOrigin: 'center center',
    transition: isDragging ? 'none' : 'transform 0.2s ease-out'
  }

  const isVertical = toolbarPosition === 'left' || toolbarPosition === 'right'
  const isPdfDoc = isPdfType(currentFileType) || isPdf(currentUrl)
  const isImageDoc =
    isImageType(currentFileType) ||
    isImage(currentUrl) ||
    (isUvDoc && uvFormat === 'image')

  const meta = currentFile?.additionalData

  const totalBytes = useMemo(() => {
    const raw = meta?.doc_size
    if (raw === null || raw === undefined) return 0
    const value = Number(raw)
    if (docSizeUnit === 'MB') return value * 1024 * 1024
    if (docSizeUnit === 'KB') return value * 1024
    return value
  }, [meta?.doc_size, docSizeUnit])

  const documentDetails: DocumentDetail[] = useMemo(() => {
    if (!currentFile) {
      return []
    }

    if (getDocumentDetails) {
      return getDocumentDetails(currentFile)
    }

    return [
      { label: 'File Name', value: meta?.doc_name || currentFileName },
      { label: 'File Type', value: prettyFileType(currentFileType, currentFileName) },
      { label: 'File Size', value: totalBytes > 0 ? formatBytes(totalBytes) : '—' },
      { label: 'Uploaded by', value: emptyToDash(meta?.trs_created_by) },
      { label: 'Uploaded Date', value: formatDateTime(meta?.trs_created_date) },
      { label: 'Document Category', value: emptyToDash(meta?.category) },
      { label: 'Pages', value: isPdfDoc || isTiffDoc ? numPages || '—' : 1 }
    ]
  }, [
    currentFile,
    getDocumentDetails,
    meta,
    currentFileName,
    currentFileType,
    totalBytes,
    isPdfDoc,
    isTiffDoc,
    numPages
  ])

  const openDocumentInfo = (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (!currentFile) {
      return
    }

    const originalIdx = files.indexOf(currentFile)

    onDocumentInfoOpen?.(
      currentFile,
      originalIdx !== -1 ? originalIdx : activeFilteredIndex
    )

    if (e && e.currentTarget) {
      setInfoAnchor(e.currentTarget.getBoundingClientRect())
    }

    setIsInfoOpen(true)
  }

  const runDelete = async () => {
    if (!currentFile || !onDelete || !needDelete) {
      return
    }

    const originalIdx = files.indexOf(currentFile)

    try {
      setIsDeleting(true)

      await onDelete(
        currentFile,
        originalIdx !== -1 ? originalIdx : activeFilteredIndex
      )

      /* The owner hands back a list one shorter, which reopens at its first
       * document — the index the owner will report back through
       * `currentUrlIndex` anyway. */
      setFilteredIndex(0)

      resetZoomAndPosition()
    } finally {
      setIsDeleting(false)
    }
  }

  const handleDeleteClick = () => {
    runDelete()
    return
    if (!currentFile || !onDelete || isDeleting) {
      return
    }

    setIsInfoOpen(false)

    if (needDeleteConfirm) {
      setIsDeleteConfirmOpen(true)
      return
    }

    void runDelete()
  }

  /* ---------- Compact button style ---------- */
  const navBtnBase =
    'mx-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700 dark:disabled:opacity-35'
  const positionClass =
    toolbarAlignment === 'start'
      ? 'justify-start'
      : toolbarAlignment === 'center'
      ? 'justify-center'
      : 'justify-end'

  /* ---------- Zoom Controls ---------- */
  const zoomControls = (
    <div
      className={`flex shrink-0 items-center gap-0.5 ${
        isVertical ? 'flex-col' : 'flex-row'
      }`}
    >
      <button
        onClick={handleZoomIn}
        disabled={zoom >= 4}
        className={navBtnBase}
        title='Zoom in'
        aria-label='Zoom in'
      >
        <MdZoomIn size={18} />
      </button>

      <button
        onClick={handleResetZoom}
        className={navBtnBase}
        title='Reset zoom'
        aria-label='Reset zoom'
      >
        <MdRefresh size={18} />
      </button>

      <button
        onClick={handleZoomOut}
        disabled={zoom <= 1}
        className={navBtnBase}
        title='Zoom out'
        aria-label='Zoom out'
      >
        <MdZoomOut size={18} />
      </button>

      {needDocumentInfo && filteredFiles.length > 0 && !!currentFile && (
        <button
          onClick={openDocumentInfo}
          className={navBtnBase}
          title='Document information'
          aria-label='Document information'
          aria-haspopup='dialog'
          aria-expanded={isInfoOpen}
        >
          <MdInfoOutline size={18} />
        </button>
      )}
    </div>
  )

  /* ---------- File Navigation Controls ---------- */
  const fileNavControls = (
    <div
      className={`flex shrink-0 items-center gap-0.5 ${
        isVertical ? 'flex-col' : 'flex-row'
      }`}
    >
      <button
        onClick={goToFirst}
        disabled={skipBackDisabled}
        className={navBtnBase}
        title={skipBackLabel}
        aria-label={skipBackLabel}
      >
        <MdOutlineSkipPrevious size={18} />
      </button>

      <button
        onClick={goToPrevious}
        disabled={isFirst || filteredFiles.length === 0}
        className={navBtnBase}
        title='Previous document'
        aria-label='Previous document'
      >
        <MdKeyboardBackspace size={18} />
      </button>

      <div
        className={`flex shrink-0 select-none items-center justify-center whitespace-nowrap text-xs font-normal leading-tight text-slate-800 dark:text-slate-200 ${
          isVertical
            ? 'min-h-8 w-8 flex-col py-1'
            : 'min-h-8 px-1'
        }`}
      >
        <span>
          {String(
            filteredFiles.length > 0 ? activeFilteredIndex + 1 : 0
          ).padStart(2, '0')}
        </span>
        <span className={isVertical ? '' : 'px-1'}>/</span>
        <span>{String(filteredFiles.length).padStart(2, '0')}</span>
      </div>

      <button
        onClick={goToNext}
        disabled={isLast || filteredFiles.length === 0}
        className={navBtnBase}
        title='Next document'
        aria-label='Next document'
      >
        <MdKeyboardBackspace size={18} className='rotate-180' />
      </button>

      <button
        onClick={goToLast}
        disabled={skipForwardDisabled}
        className={navBtnBase}
        title={skipForwardLabel}
        aria-label={skipForwardLabel}
      >
        <MdOutlineSkipNext size={18} />
      </button>
    </div>
  )

  /* ---------- Delete Control ---------- */
  const canDelete = needDelete && !!onDelete

  const deleteControl = canDelete &&
    filteredFiles.length > 0 &&
    !!currentFile && (
      <div
        className={`flex shrink-0 items-center gap-0.5 ${
          isVertical ? 'flex-col' : 'flex-row'
        }`}
      >
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className={navBtnBase}
          title='Delete document'
          aria-label='Delete document'
        >
          <RiDeleteBinLine size={18} />
        </button>
      </div>
    )

  /* ---------- File Type Filter Dropdown ---------- */
  const formatFilterDropdown = files.length > 0 && (
    <div className='relative shrink-0' ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(prev => !prev)}
        className={`flex h-8 shrink-0 items-center justify-center rounded-lg bg-white text-[11px] font-semibold text-slate-800 shadow-sm transition-colors hover:bg-gray-50 active:bg-gray-100 dark:bg-gray-800 dark:text-slate-200 dark:hover:bg-gray-700 ${
          toolbarPosition === 'left'
            ? 'w-9 px-1'
            : toolbarPosition === 'right'
            ? 'w-8 px-1'
            : 'max-w-full gap-1 px-2'
        }`}
        title='Filter by file type'
        aria-haspopup='true'
        aria-expanded={isDropdownOpen}
      >
        <span className={isVertical ? 'sr-only' : 'truncate'}>
          {selectedTypeFilter}
        </span>

        <MdExpandMore
          size={16}
          className={`shrink-0 text-slate-600 transition-transform duration-200 dark:text-slate-300 ${
            isDropdownOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isDropdownOpen && (
        <div className='absolute right-0 top-full z-50 mt-1.5 min-w-[140px] rounded-xl border border-gray-100 bg-white p-1.5 shadow-xl dark:border-gray-700 dark:bg-gray-800'>

          <div className='flex flex-col gap-0.5'>
            {filterOptions.map(type => {
              const count = filterTypeCounts[type] || 0
              const isActive = selectedTypeFilter === type

              return (
                <button
                  key={type}
                  onClick={() => handleSelectFilter(type)}
                  className={`flex w-full items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isActive
                      ? 'bg-slate-100 font-semibold text-slate-900 dark:bg-gray-700 dark:text-white'
                      : 'text-slate-700 hover:bg-gray-50 dark:text-slate-300 dark:hover:bg-gray-700/60'
                  }`}
                >
                  <div className='flex min-w-0 items-center gap-1.5'>
                    <span className='truncate'>{type}</span>

                    {isActive && (
                      <MdCheck
                        size={14}
                        className='shrink-0 text-slate-900 dark:text-white'
                      />
                    )}
                  </div>

                  <span className='shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 dark:bg-gray-900 dark:text-gray-400'>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )

  /* ---------- Page Controls (PDF & multi-page TIFF) ---------- */
  const pageControls = numPages > 1 && (
    <div className='flex shrink-0 flex-wrap items-center justify-center gap-2 py-1'>
      <button
        onClick={() => setPdfPageNumber(1)}
        disabled={pdfPageNumber <= 1}
        className='flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-slate-900 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
        title='First page'
      >
        <MdFirstPage size={16} />
      </button>

      <button
        onClick={() => setPdfPageNumber(prev => Math.max(prev - 1, 1))}
        disabled={pdfPageNumber <= 1}
        className='flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-slate-900 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
        title='Previous page'
      >
        <MdNavigateBefore size={16} />
      </button>

      <span className='min-w-[4rem] text-center text-xs text-slate-700'>
        {pdfPageNumber} of {numPages}
      </span>

      <button
        onClick={() =>
          setPdfPageNumber(prev => Math.min(prev + 1, numPages))
        }
        disabled={pdfPageNumber >= numPages}
        className='flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-slate-900 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
        title='Next page'
      >
        <MdNavigateNext size={16} />
      </button>

      <button
        onClick={() => setPdfPageNumber(numPages)}
        disabled={pdfPageNumber >= numPages}
        className='flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-slate-900 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
        title='Last page'
      >
        <MdLastPage size={16} />
      </button>
    </div>
  )

  /* ---------- Content Rendering ---------- */
  const renderContent = () => {
    if (files.length === 0 || filteredFiles.length === 0 || !currentUrl) {
      return (
        <div className='flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border bg-gray-50 p-6 text-center shadow-sm'>
          <span className='text-[clamp(0.75rem,1.2vw,1.125rem)] font-semibold text-gray-700'>
            No Document Found
          </span>

          <p className='text-sm text-gray-500'>
            {files.length === 0
              ? 'The attachment or document you are looking for is unavailable.'
              : `No documents match the "${selectedTypeFilter}" filter.`}
          </p>
        </div>
      )
    }

    if (isUvDoc && (uvFormat === '' || uvFormat === 'loading')) {
      return (
        <div className='flex h-full w-full items-center justify-center'>
          <p className='text-sm text-gray-500'>Loading image…</p>
        </div>
      )
    }

    if (isUvDoc && uvFormat === 'text') {
      return (
        <div className='h-full w-full overflow-auto bg-white p-4'>
          <pre className='whitespace-pre-wrap break-words text-xs text-slate-900'>
            {uvText}
          </pre>
        </div>
      )
    }

    if (isUvDoc && uvFormat === 'unknown') {
      return (
        <div className='flex h-full w-full items-center justify-center'>
          <p className='text-sm text-red-500'>
            Unable to preview this UV file format.
          </p>
        </div>
      )
    }

    if (isTiffDoc && (!tiffImageUrl || tiffError)) {
      return (
        <div className='flex h-full w-full items-center justify-center'>
          <p className={`text-sm ${tiffError ? 'text-red-500' : 'text-gray-500'}`}>
            {tiffError || 'Loading image…'}
          </p>
        </div>
      )
    }

  if (isImageDoc || isTiffDoc) {
    return (
      <div className='flex h-full w-full flex-col overflow-hidden'>
        <div
          ref={contentRef}
          className='min-h-0 w-full flex-1 overflow-hidden'
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          {...panHandlers}
        >
          <Image
              src={isTiffDoc ? tiffImageUrl : uvImageUrl || currentUrl}
            alt='document'
            width={100}
            height={100}
            className='h-full w-full select-none object-contain'
            style={transformStyle}
            draggable={false}
            unoptimized
          />
        </div>

        {isTiffDoc && pageControls}
        </div>
      )
    }

    if (isWordDoc) {
      if (wordLoading) {
        return (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-sm text-gray-500'>Loading document…</p>
          </div>
        )
      }

      if (wordError) {
        return (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-sm text-red-500'>{wordError}</p>
          </div>
        )
      }

      return (
        <div
          ref={contentRef}
          className='h-full w-full overflow-auto bg-white p-6'
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          {...panHandlers}
        >
          <div
            className='max-w-none text-slate-900 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-xl [&_h2]:font-bold [&_h3]:text-lg [&_h3]:font-semibold [&_img]:max-w-full [&_p]:mb-2 [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:p-1 [&_th]:border [&_th]:border-gray-300 [&_th]:p-1'
            style={transformStyle}
            dangerouslySetInnerHTML={{
              __html: wordHtml
            }}
          />
        </div>
      )
    }

    if (isExcelDoc) {
      if (excelLoading) {
        return (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-sm text-gray-500'>Loading spreadsheet…</p>
          </div>
        )
      }

      if (excelError) {
        return (
          <div className='flex h-full w-full items-center justify-center'>
            <p className='text-sm text-red-500'>{excelError}</p>
          </div>
        )
      }

      const sheetNames = workbook?.SheetNames || []

      const {
        html: activeSheetHtml,
        pageCount,
        startRow,
        endRow,
        totalRows
      } = sheetPageData

      const currentSheetPage = Math.min(sheetRowPage, pageCount - 1)

      return (
        <div className='flex h-full w-full flex-col overflow-hidden'>
          {sheetNames.length > 1 && (
            <div className='flex shrink-0 gap-1 overflow-x-auto border-b bg-gray-100 px-2 py-1 dark:border-gray-600 dark:bg-gray-900'>
              {sheetNames.map(name => (
                <button
                  key={name}
                  onClick={() => setActiveSheet(name)}
                  className={`shrink-0 rounded px-2 py-1 text-xs font-medium ${
                    name === activeSheet
                      ? 'bg-white text-slate-900 shadow'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}

          <div
            ref={contentRef}
            className='min-h-0 flex-1 overflow-auto bg-white p-2'
            style={{
              cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
            }}
            {...panHandlers}
          >
            <div
              className='inline-block text-slate-900 [&_table]:border-collapse [&_td]:border [&_td]:border-gray-300 [&_td]:px-2 [&_td]:py-1 [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-100 [&_th]:px-2 [&_th]:py-1'
              style={transformStyle}
              dangerouslySetInnerHTML={{
                __html: activeSheetHtml
              }}
            />
          </div>

          {pageCount > 1 && (
            <div className='flex shrink-0 flex-wrap items-center justify-center gap-2 py-1'>
              <button
                onClick={() => setSheetRowPage(prev => Math.max(prev - 1, 0))}
                disabled={currentSheetPage <= 0}
                className='flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-slate-900 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
                title='Previous rows'
              >
                <MdNavigateBefore size={16} />
              </button>

              <span className='min-w-[10rem] text-center text-xs text-slate-700'>
                Rows {startRow + 1}–{endRow} of {totalRows}
              </span>

              <button
                onClick={() =>
                  setSheetRowPage(prev => Math.min(prev + 1, pageCount - 1))
                }
                disabled={currentSheetPage >= pageCount - 1}
                className='flex h-7 w-7 shrink-0 items-center justify-center rounded bg-gray-200 text-slate-900 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
                title='Next rows'
              >
                <MdNavigateNext size={16} />
              </button>
            </div>
          )}
        </div>
      )
    }

    if (isPdfDoc) {
      return (
        <div
          ref={contentRef}
          className='flex h-full w-full flex-col overflow-hidden'
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
          }}
          {...panHandlers}
        >
          <div className='flex min-h-0 flex-1 items-start justify-center overflow-auto'>
            <div style={transformStyle}>
              <Document
                file={currentUrl}
                onLoadSuccess={({ numPages: n }) => setNumPages(n)}
                loading={<p className='text-sm text-gray-500'>Loading PDF…</p>}
                error={
                  <p className='text-sm text-red-500'>Failed to load PDF.</p>
                }
              >
                <Page
                  pageNumber={pdfPageNumber}
                  renderTextLayer
                  renderAnnotationLayer
                />
              </Document>
            </div>
          </div>

          {pageControls}
        </div>
      )
    }

    return (
      <div
        ref={contentRef}
        className='h-full w-full overflow-hidden'
        style={{
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
        {...panHandlers}
      >
        <div
          className='relative h-full w-full overflow-hidden'
          style={transformStyle}
        >
          <iframe
            src={
              isOffice(currentUrl)
                ? `https://docs.google.com/gview?url=${encodeURIComponent(
                    currentUrl
                  )}&embedded=true`
                : currentUrl
            }
            className='h-full w-full border-0'
          />
        </div>
      </div>
    )
  }

  const viewerElement = (
    <div
      className={`relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden bg-white dark:bg-black ${className}`}
      style={style}
    >
      {/* ── TOP ── filename + controls */}
      {toolbarPosition === 'top' && files.length > 0 && (
        <div className='flex min-w-0 shrink-0 items-center gap-2 border-b border-gray-200/80 bg-[#f4f5fa] px-3 py-3 dark:border-gray-800 dark:bg-gray-900 sm:gap-3 sm:px-4'>
          <div className='min-w-0 flex-[4] overflow-hidden'>
            <span
              className='block truncate text-sm font-medium text-slate-800 dark:text-slate-200 sm:text-lg'
              title={currentFileName}
            >
              {currentFileName}
            </span>
          </div>

          <div className='flex shrink-0 flex-nowrap items-center justify-end gap-0.5'>
            {zoomControls}
            {fileNavControls}
            {deleteControl}
            {formatFilterDropdown}
          </div>
        </div>
      )}

      {/* ── BOTTOM ── filename bar */}
      {toolbarPosition === 'bottom' && files.length > 0 && (
        <div className='flex min-w-0 shrink-0 items-center rounded-lg bg-[#f4f5fa] px-4 py-2.5 shadow dark:bg-gray-900'>
          <span
            className='min-w-0 flex-1 truncate text-sm font-medium text-slate-800 dark:text-slate-200'
            title={currentFileName}
          >
            {currentFileName}
          </span>
        </div>
      )}

      {/* ── content area ── */}
      {!isVertical && (
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          {renderContent()}
        </div>
      )}

      {/* ── BOTTOM controls ── */}
      {toolbarPosition === 'bottom' && files.length > 0 && (
        <div
          className={`flex shrink-0 flex-nowrap items-center gap-1 overflow-x-auto border-t border-gray-200/80 bg-[#f4f5fa] px-3 py-2.5 dark:border-gray-800 dark:bg-gray-900 ${positionClass}`}
        >
          {zoomControls}
          {fileNavControls}
          {deleteControl}
          {formatFilterDropdown}
        </div>
      )}

      {/* ── LEFT / RIGHT ── */}
      {isVertical && (
        <div
          className={`flex min-h-0 flex-1 overflow-hidden ${
            toolbarPosition === 'left' ? 'flex-row' : 'flex-row-reverse'
          }`}
        >
          <div
            className={`flex w-auto shrink-0 flex-col items-center gap-1 bg-[#f4f5fa] px-1.5 py-2 dark:bg-gray-900 ${positionClass}`}
          >
            {zoomControls}
            {fileNavControls}
            {deleteControl}
            {formatFilterDropdown}
          </div>

          <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
            {files.length > 0 && (
              <div className='shrink-0 border-b border-gray-200/80 bg-[#f4f5fa] px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900'>
                <span
                  className='block min-w-0 truncate text-sm font-medium text-slate-800 dark:text-slate-200'
                  title={currentFileName}
                >
                  {currentFileName}
                </span>
              </div>
            )}

            <div className='relative min-h-0 flex-1 overflow-hidden'>
              {renderContent()}
            </div>
          </div>
        </div>
      )}

      {/* Document Information Modal */}
      {currentFile && (
        <DocumentInformation
          open={isInfoOpen}
          onClose={() => setIsInfoOpen(false)}
          anchor={infoAnchor}
          fileName={meta?.doc_name || currentFileName}
          totalBytes={totalBytes}
          uploadedBytes={currentFile.uploadedBytes}
          status={currentFile.uploadStatus ?? 'completed'}
          details={documentDetails}
        />
      )}

      {/* Delete confirmation */}
      {canDelete && needDeleteConfirm && (
        <ConfirmModal
          confirmMsg={isDeleteConfirmOpen}
          setConfirmMsg={setIsDeleteConfirmOpen}
          confirmMsgTitle={deleteConfirmTitle}
          confirmMsgContent={deleteConfirmContent}
          handleConfirm={runDelete}
        />
      )}
    </div>
  )

  return (
    <CommonHeaderAndTooltip
      needTooltip={needTooltip}
      tooltipProps={tooltipProps}
      headerText={headerText}
      headerPosition={headerPosition}
      className={className}
    >
      {viewerElement}
    </CommonHeaderAndTooltip>
  )
}

export default DocViewer