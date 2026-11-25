'use client'

import React, { useEffect, useRef } from 'react'
import { MdInfoOutline, MdClose } from 'react-icons/md'
import { CiFileOn } from 'react-icons/ci'

export type UploadStatus = 'uploading' | 'completed' | 'failed'

export type DocumentDetail = {
  label: string
  value: React.ReactNode
}

export const formatBytes = (bytes: number, decimals = 2): string => {
  if (!bytes || bytes <= 0) return '0 B'

  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`
}

const POPUP_WIDTH = 400

interface DocumentInformationProps {
  open: boolean
  onClose: () => void
  anchor?: DOMRect | null
  fileName?: string
  fileType?: string
  totalBytes?: number
  uploadedBytes?: number
  status?: UploadStatus
  details?: DocumentDetail[]
}

const progressPercent = (uploaded?: number, total?: number): number => {
  if (!total || total <= 0) return 0
  if (!uploaded || uploaded < 0) return 0

  return Math.min(100, Math.round((uploaded / total) * 100))
}

const statusLabel = (status: UploadStatus): string => {
  switch (status) {
    case 'uploading':
      return 'Uploading…'
    case 'failed':
      return 'Upload failed'
    case 'completed':
    default:
      return 'Completed'
  }
}

export const DocumentInformation: React.FC<DocumentInformationProps> = ({
  open,
  onClose,
  anchor,
  fileName,
  totalBytes,
  uploadedBytes,
  status = 'completed',
  details = []
}) => {
  const uploading = status === 'uploading'
  const progress = progressPercent(uploadedBytes, totalBytes)

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)

    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const onResize = () => onClose()
    // Ignore scrolls that happen inside the panel itself (e.g. the
    // scrollable body) — only dismiss on scrolls elsewhere on the page.
    const onScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return
      onClose()
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onScroll, true)

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [open, onClose])

  if (!open) return null

  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  let top = 16
  let left = 16

  if (anchor) {
    left = Math.min(anchor.right - POPUP_WIDTH, viewportWidth - POPUP_WIDTH - 8)
    top = Math.min(anchor.bottom + 8, viewportHeight - 60)
  }
  left = Math.max(8, left)
  top = Math.max(8, top)

  // Cap the scrollable body to whatever space is actually left below the
  // panel's top, so a panel positioned low on the screen doesn't get its
  // bottom (and the only way to reach the rest of its content) clipped
  // past the viewport edge — a fixed 70vh doesn't account for `top`.
  const bodyMaxHeight = Math.max(viewportHeight - top - 76, 120)

  return (
    <>
      {/* Dismiss layer */}
      <div
        className='fixed inset-0 z-40 bg-gray-900/20'
        onClick={onClose}
        aria-hidden='true'
      />

      {/* Popup panel */}
      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        className='fixed z-50 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800'
        style={{
          top,
          left,
          width: Math.min(POPUP_WIDTH, viewportWidth - 16)
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className='flex items-center justify-between gap-2 border-b border-gray-100 bg-[#f7f7f9] px-4 py-3 dark:border-gray-700 dark:bg-gray-900'>
          <span className='flex min-w-0 items-center gap-2 text-base font-semibold text-gray-800 dark:text-gray-100'>
            <MdInfoOutline className='h-5 w-5 shrink-0' />
            <span className='truncate'>Document Information</span>
          </span>

          <button
            onClick={onClose}
            aria-label='Close'
            className='flex h-7 w-7 shrink-0 items-center justify-center rounded text-gray-500 transition hover:bg-gray-200 hover:text-gray-800 dark:hover:bg-gray-700 dark:hover:text-gray-100'
          >
            <MdClose className='h-4 w-4' />
          </button>
        </div>

        {/* Body */}
        <div
          className='overflow-y-auto p-4'
          style={{ maxHeight: bodyMaxHeight }}
        >
          {/* File summary */}
          <div className='mb-3 rounded-lg bg-[#f7f7f9] px-4 py-3 dark:bg-gray-900'>
            <div className='flex items-center gap-3'>
              {/* File icon */}
              <div className='flex h-9 w-9 shrink-0 items-center justify-center'>
                <CiFileOn className='h-8 w-8 text-red-500' />
              </div>

              {/* File name + status */}
              <div className='min-w-0 flex-1'>
                <div
                  className='truncate text-sm font-semibold text-gray-800 dark:text-gray-100'
                  title={fileName}
                >
                  {fileName || '—'}
                </div>

                <div className='mt-0.5 flex items-center gap-1.5 text-[10px] text-gray-400'>
                  {totalBytes ? (
                    <span>
                      {formatBytes(uploadedBytes ?? totalBytes)} of{' '}
                      {formatBytes(totalBytes)}
                    </span>
                  ) : null}

                  {status === 'completed' && (
                    <>
                      <span className='text-gray-300'>•</span>

                      <span className='flex items-center gap-1 text-gray-400'>
                        <span className='flex h-3.5 w-3.5 items-center justify-center rounded-full bg-green-500 text-[9px] text-white'>
                          ✓
                        </span>
                        Completed
                      </span>
                    </>
                  )}

                  {status === 'failed' && (
                    <>
                      <span className='text-gray-300'>•</span>
                      <span className='text-red-500'>
                        {statusLabel(status)}
                      </span>
                    </>
                  )}

                  {uploading && (
                    <>
                      <span className='text-gray-300'>•</span>
                      <span>Uploading…</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className='mt-3'>
                <div className='mb-1 flex justify-between text-[10px] text-gray-400'>
                  <span>Uploading</span>
                  <span>{progress}%</span>
                </div>

                <div className='h-1.5 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className='h-full rounded-full bg-blue-500 transition-all duration-300'
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Failed message */}
          {status === 'failed' && (
            <div className='mb-3 rounded-md bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/30 dark:text-red-300'>
              Upload failed. Please try again.
            </div>
          )}

          {/* Document details */}
          {details.length > 0 && (
            <div className='space-y-2.5'>
              {details.map((detail, index) => (
                <div
                  key={`${detail.label}-${index}`}
                  className='grid grid-cols-[125px_1fr] items-center gap-2'
                >
                  {/* Label */}
                  <div className='text-xs font-medium text-gray-600 dark:text-gray-300'>
                    {detail.label}
                  </div>

                  {/* Value */}
                  <div className='min-h-[34px] min-w-0 rounded-md bg-[#f7f7f9] px-3 py-2 text-xs font-medium text-gray-700 dark:bg-gray-900 dark:text-gray-200'>
                    <div className='break-words'>{detail.value ?? '—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <hr className='my-3 border-t border-gray-200 dark:border-gray-700' />

          {/* Information note */}
          <div className='mt-4 flex items-center gap-2 rounded-md bg-[#eef1ff] px-3 py-2.5 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300'>
            <MdInfoOutline className='h-6 w-6 shrink-0' />

            <span>These are the details of the uploaded document.</span>
          </div>
        </div>
      </div>
    </>
  )
}

export default DocumentInformation;