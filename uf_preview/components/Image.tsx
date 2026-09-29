'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { Tooltip } from './Tooltip'
import Image from "next/image";
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
import {
  MdNavigateBefore,
  MdNavigateNext,
  MdFirstPage,
  MdLastPage
} from 'react-icons/md'
import { FiZoomIn, FiZoomOut, FiRotateCcw } from 'react-icons/fi'

type ContentAlign = 'left' | 'center' | 'right'

export type ImageItem = {
  url: string
  fileName?: string
  alt?: string
}
type toolbarPosition = 'top' | 'bottom' | 'left' | 'right'
type toolbarAlignment = 'start' | 'center' | 'end'
interface ImageProps {
  /** Single URL, array of URLs, or array of ImageItem objects */
  url?: string | string[] | ImageItem[]
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  alt?: string
  className?: string
  fillContainer?: boolean
  contentAlign?: ContentAlign
  toolbarPosition?: toolbarPosition
  toolbarAlignment?: toolbarAlignment
  /** Controlled mode: current index */
  currentIndex?: number
  /** Controlled mode: callback when index changes */
  onIndexChange?: (index: number) => void
  /** Show navigation controls when multiple images */
  showNavigation?: boolean
}

export const ImageC: React.FC<ImageProps> = ({
  url,
  needTooltip = false,
  tooltipProps,
  toolbarPosition = 'top',
  toolbarAlignment = 'end',
  headerText,
  headerPosition = 'top',
  alt = '',
  className = '',
  fillContainer = true,
  contentAlign = 'center',
  currentIndex: controlledIndex,
  onIndexChange,
  showNavigation = true
}) => {
  const { theme } = useGlobal()
  const isDark = theme === 'dark' || theme === 'dark-hc'
  const isVertical = toolbarPosition === 'left' || toolbarPosition === 'right'

  const positionClass =
    toolbarAlignment === 'start'
      ? 'justify-start'
      : toolbarAlignment === 'center'
      ? 'justify-center'
      : 'justify-end'

  const navBtnBase =
    'flex h-8 w-8 items-center justify-center rounded bg-gray-200 text-slate-900 hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50'
  // Normalize input to ImageItem array
  const images: ImageItem[] = React.useMemo(() => {
    if (!url) return []
    if (typeof url === 'string') {
      return [{ url, alt }]
    }
    if (Array.isArray(url)) {
      return url.map(item => {
        if (typeof item === 'string') {
          return { url: item }
        }
        return item
      })
    }
    return []
  }, [url, alt])

  // Internal state for uncontrolled mode
  const [internalIndex, setInternalIndex] = useState(0)

  // Track error states per image
  const [errorStates, setErrorStates] = useState<Record<number, boolean>>({})

  // Reset error states when images change
  useEffect(() => {
    setErrorStates({})
  }, [images])

  // Zoom and pan state
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const contentRef = useRef<HTMLDivElement>(null)

  const MIN_ZOOM = 1
  const MAX_ZOOM = 4
  const ZOOM_STEP = 0.25

  // Use controlled or uncontrolled index
  const activeIndex =
    controlledIndex !== undefined ? controlledIndex : internalIndex

  // Bounds checking - handle empty array case
  const safeIndex =
    images.length > 0
      ? Math.max(0, Math.min(activeIndex, images.length - 1))
      : 0
  const currentImage = images.length > 0 ? images[safeIndex] : undefined
  const currentFileName = currentImage?.fileName || 'Image'

  const isFirst = safeIndex === 0
  const isLast = images.length === 0 || safeIndex === images.length - 1

  // Reset zoom and position when changing images
  const resetZoomAndPosition = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
  }, [])

  const goToPrevious = useCallback(() => {
    if (images.length === 0 || isFirst) return
    const newIndex = safeIndex - 1
    if (onIndexChange !== undefined && controlledIndex !== undefined) {
      onIndexChange(newIndex)
    } else {
      setInternalIndex(newIndex)
    }
    resetZoomAndPosition()
  }, [
    images.length,
    isFirst,
    safeIndex,
    onIndexChange,
    controlledIndex,
    resetZoomAndPosition
  ])

  const goToNext = useCallback(() => {
    if (images.length === 0 || isLast) return
    const newIndex = safeIndex + 1
    if (onIndexChange !== undefined && controlledIndex !== undefined) {
      onIndexChange(newIndex)
    } else {
      setInternalIndex(newIndex)
    }
    resetZoomAndPosition()
  }, [
    images.length,
    isLast,
    safeIndex,
    onIndexChange,
    controlledIndex,
    resetZoomAndPosition
  ])

  const goToFirst = useCallback(() => {
    if (images.length === 0 || isFirst) return
    if (onIndexChange !== undefined && controlledIndex !== undefined) {
      onIndexChange(0)
    } else {
      setInternalIndex(0)
    }
    resetZoomAndPosition()
  }, [
    images.length,
    isFirst,
    onIndexChange,
    controlledIndex,
    resetZoomAndPosition
  ])

  const goToLast = useCallback(() => {
    if (images.length === 0 || isLast) return
    const lastIndex = images.length - 1
    if (onIndexChange !== undefined && controlledIndex !== undefined) {
      onIndexChange(lastIndex)
    } else {
      setInternalIndex(lastIndex)
    }
    resetZoomAndPosition()
  }, [
    images.length,
    isLast,
    onIndexChange,
    controlledIndex,
    resetZoomAndPosition
  ])

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + ZOOM_STEP, MAX_ZOOM))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - ZOOM_STEP, MIN_ZOOM))
  }

  const handleResetZoom = () => {
    resetZoomAndPosition()
  }

  // Mouse wheel zoom
  useEffect(() => {
    const element = contentRef.current
    if (!element) return

    const handleWheelEvent = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        e.stopPropagation()
        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
        setZoom(prev => Math.min(Math.max(prev + delta, MIN_ZOOM), MAX_ZOOM))
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

    element.addEventListener('wheel', handleWheelEvent, { passive: false })
    return () => {
      element.removeEventListener('wheel', handleWheelEvent)
    }
  }, [zoom])

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
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

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleMouseLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Touch handlers for mobile
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (zoom > 1 && e.touches.length === 1) {
        const touch = e.touches[0]
        setIsDragging(true)
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y
        })
      }
    },
    [zoom, position]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (isDragging && zoom > 1 && e.touches.length === 1) {
        const touch = e.touches[0]
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y
        })
      }
    },
    [isDragging, dragStart, zoom]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleImageError = useCallback((index: number) => {
    setErrorStates(prev => ({ ...prev, [index]: true }))
  }, [])

  const handleImageLoad = useCallback((index: number) => {
    setErrorStates(prev => ({ ...prev, [index]: false }))
  }, [])

  // Render error state
  const renderError = () => (
    <div className='flex h-full w-full flex-col items-center justify-center rounded-xl border border-red-500 bg-gray-50 p-4 text-center'>
      <span className='text-sm font-semibold text-gray-700'>
        Image Not Found
      </span>
      <p className='text-xs text-gray-500'>
        The image could not be loaded or is unavailable.
      </p>
    </div>
  )

  // Render no image state
  const renderNoImage = () => (
    <div className='flex h-full w-full flex-col items-center justify-center rounded-xl border border-gray-300 bg-gray-50 p-4 text-center'>
      <span className='text-sm font-semibold text-gray-700'>
        No Image Available
      </span>
      <p className='text-xs text-gray-500'>No image URL was provided.</p>
    </div>
  )

  // Render image content
  const renderContent = () => {
    if (images.length === 0 || !currentImage?.url) {
      return renderNoImage()
    }

    if (errorStates[safeIndex]) {
      return renderError()
    }

    const transformStyle = {
      transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
      transformOrigin: 'center center',
      cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
      transition: isDragging ? 'none' : 'transform 0.2s ease-out'
    }

    return (
      <div
        ref={contentRef}
        className='h-full w-full overflow-hidden'
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.alt || currentImage.fileName || alt || ''}
          className='h-full w-full select-none object-contain'
          width={100}
          height={100}
          style={transformStyle}
          draggable={false}
          onError={() => handleImageError(safeIndex)}
          onLoad={() => handleImageLoad(safeIndex)}
        />
      </div>
    )
  }
  const hasZoom = images.length > 0
  const hasNav = showNavigation && images.length > 1

  const controlsBlock =
    hasZoom || hasNav ? (
      <div
        className={`flex items-center gap-1 rounded-lg border bg-white p-1 ${
          isVertical ? 'flex-col' : 'flex-row'
        }`}
      >
        {/* Zoom */}
        {hasZoom && (
          <>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= MAX_ZOOM}
              className={navBtnBase}
            >
              <FiZoomIn size={18} />
            </button>

            <span className='flex h-8 w-10 items-center justify-center rounded border bg-gray-200 text-[12px] font-medium text-slate-900'>
              {Math.round(zoom * 100)}%
            </span>

            <button
              onClick={handleZoomOut}
              disabled={zoom <= MIN_ZOOM}
              className={navBtnBase}
            >
              <FiZoomOut size={18} />
            </button>

            <button onClick={handleResetZoom} className={navBtnBase}>
              <FiRotateCcw size={18} />
            </button>
          </>
        )}

        {/* Navigation */}
        {hasNav && (
          <>
            <button
              onClick={goToPrevious}
              disabled={isFirst}
              className={navBtnBase}
            >
              <MdNavigateBefore size={20} />
            </button>

            <button onClick={goToNext} disabled={isLast} className={navBtnBase}>
              <MdNavigateNext size={20} />
            </button>

            <span className='flex h-8 items-center px-1 text-[12px] font-medium text-slate-900'>
              {safeIndex + 1} of {images.length}
            </span>
          </>
        )}
      </div>
    ) : null
  // Main viewer elementflex items-center gap-1 rounded-lg border bg-white p-1 flex-col
  const viewerElement = (
    <div
      className={`flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden ${className}`}
    >
      {/* ---------- TOP TOOLBAR ---------- */}
      {toolbarPosition === 'top' && images.length > 0 && (
        <div className='flex shrink-0 items-center gap-2 rounded-lg bg-[#f4f5fa] px-3 py-2 shadow'>
          <span className='min-w-0 flex-1 truncate text-sm font-medium text-slate-900'>
            {currentFileName}
          </span>

          <div className={`flex w-auto items-center gap-2 ${positionClass}`}>
            {controlsBlock}
          </div>
        </div>
      )}

      {/* ---------- BOTTOM FILENAME ---------- */}
      {toolbarPosition === 'bottom' && images.length > 0 && (
        <div className='flex shrink-0 items-center rounded-lg bg-[#f4f5fa] px-3 py-2 shadow'>
          <span className='min-w-0 flex-1 truncate text-sm font-medium text-slate-900'>
            {currentFileName}
          </span>
        </div>
      )}

      {/* ---------- CONTENT (top/bottom only) ---------- */}
      {!isVertical && (
        <div className='relative min-h-0 flex-1 overflow-hidden'>
          {renderContent()}
        </div>
      )}

      {/* ---------- BOTTOM CONTROLS ---------- */}
      {toolbarPosition === 'bottom' && images.length > 0 && (
        <div
          className={`flex shrink-0 items-center gap-2 px-3 py-2 ${positionClass}`}
        >
          {controlsBlock}
        </div>
      )}

      {/* ---------- LEFT / RIGHT ---------- */}
      {isVertical && (
        <div
          className={`flex min-h-0 flex-1 overflow-hidden ${
            toolbarPosition === 'left' ? 'flex-row' : 'flex-row-reverse'
          }`}
        >
          {/* sidebar */}
          <div
            className={`flex shrink-0 flex-col gap-2 px-2 py-3 shadow ${positionClass}`}
          >
            {controlsBlock}
          </div>

          {/* filename + content */}
          <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
            {images.length > 0 && (
              <div className='shrink-0 rounded-lg bg-[#f4f5fa] px-3 py-2 shadow'>
                <span className='block truncate text-sm font-medium text-slate-900'>
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
      {viewerElement}
    </CommonHeaderAndTooltip>
  )
}