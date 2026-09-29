import { useRef, useCallback, useEffect } from 'react'
import { Text } from './Text'
import { Icon } from './Icon'
import { useGlobal } from '@/context/GlobalContext'
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'

const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]
const WEEKDAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface TimeLineProps {
  steps: Array<Record<string, any>>
  statusMap?: Record<string, { icon: string; color: string }>
  title: string
  status: string
  date: string
  view?: 'vertical' | 'horizontal'
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  className?: string
  onStepClick?: (step: Record<string, any>, index: number) => void
  onLoadMore?: () => void
  isLoadingMore?: boolean
  hasMore?: boolean
}

export const TimeLine: React.FC<TimeLineProps> = ({
  steps = [],
  statusMap = {},
  title = '',
  status = '',
  date = '',
  view = 'horizontal',
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  className = '',
  onStepClick,
  onLoadMore,
  isLoadingMore = false,
  hasMore = true
}) => {
  const { theme, displayFormat } = useGlobal()
  const scrollRef = useRef<HTMLDivElement>(null)

  const isDark = theme === 'dark' || theme === 'dark-hc'
  const getDateDisplay = (dateStr: string): string => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const y = String(d.getFullYear())
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    const dayNum = String(d.getDate())
    const monthShort = MONTHS_SHORT[d.getMonth()]
    const monthLong = MONTHS_LONG[d.getMonth()]
    const weekdayShort = WEEKDAYS_SHORT[d.getDay()]
    const fmt =
      displayFormat?.datePickerProperty?.dateDisplayFormat || 'DD-MM-YYYY'

    switch (fmt) {
      case 'YYYY-MM-DD':
        return `${y}-${mm}-${dd}`
      case 'MM-DD-YYYY':
        return `${mm}-${dd}-${y}`
      case 'DD/MM/YYYY':
        return `${dd}/${mm}/${y}`
      case 'MM/DD/YYYY':
        return `${mm}/${dd}/${y}`
      case 'YYYY/MM/DD':
        return `${y}/${mm}/${dd}`
      case 'DD.MM.YYYY':
        return `${dd}.${mm}.${y}`
      case 'D MMM YYYY':
        return `${dayNum} ${monthShort} ${y}`
      case 'MMM D, YYYY':
        return `${monthShort} ${dayNum}, ${y}`
      case 'MMMM D, YYYY':
        return `${monthLong} ${dayNum}, ${y}`
      case 'D MMMM YYYY':
        return `${dayNum} ${monthLong} ${y}`
      case 'ddd, D MMM YYYY':
        return `${weekdayShort}, ${dayNum} ${monthShort} ${y}`
      case 'DD-MM-YYYY':
      default:
        return `${dd}-${mm}-${y}`
    }
  }

  const getTimeDisplay = (dateStr: string): string => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    const H = d.getHours()
    const HH = String(H).padStart(2, '0')
    const min = String(d.getMinutes()).padStart(2, '0')
    const sec = String(d.getSeconds()).padStart(2, '0')
    const h12 = H % 12 === 0 ? 12 : H % 12
    const hh = String(h12).padStart(2, '0')
    const isPM = H >= 12
    const fmt =
      displayFormat?.timePickerProperty?.timeDisplayFormat || 'HH:mm'

    switch (fmt) {
      case 'HH:mm':
        return `${HH}:${min}`
      case 'HH:mm:ss':
        return `${HH}:${min}:${sec}`
      case 'hh:mm a':
        return `${hh}:${min} ${isPM ? 'pm' : 'am'}`
      case 'hh:mm:ss a':
        return `${hh}:${min}:${sec} ${isPM ? 'pm' : 'am'}`
      case 'h:mm A':
        return `${h12}:${min} ${isPM ? 'PM' : 'AM'}`
      case 'HH:mm[:ss]':
      default:
        return sec === '00' ? `${HH}:${min}` : `${HH}:${min}:${sec}`
    }
  }

  const formatDateTimeDisplay = (dateStr: string): string => {
    const d = getDateDisplay(dateStr)
    const t = getTimeDisplay(dateStr)
    return t ? `${d} ${t}` : d
  }

  const convertToFormat = (data: any) => {
    if (data == null) return data
    let d: Date | null = null
    if (data instanceof Date) {
      d = data
    } else if (typeof data === 'string' && data.length >= 6) {
      const p = new Date(data)
      if (!isNaN(p.getTime())) d = p
    } else if (typeof data === 'number') {
      const p = new Date(data)
      if (!isNaN(p.getTime())) d = p
    }
    if (d) return formatDateTimeDisplay(d.toISOString())
    return data
  }
  const isHorizontal = view === 'horizontal'

  // Auto-load more if content doesn't fill the container
  useEffect(() => {
    if (!scrollRef.current || !onLoadMore || isLoadingMore || !hasMore) return

    const checkAndLoadMore = () => {
      if (!scrollRef.current) return
      const { scrollHeight, clientHeight, scrollWidth, clientWidth } =
        scrollRef.current

      if (isHorizontal) {
        // If content width is less than or equal to container width, load more
        if (scrollWidth <= clientWidth) {
          onLoadMore()
        }
      } else {
        // If content height is less than or equal to container height, load more
        if (scrollHeight <= clientHeight) {
          onLoadMore()
        }
      }
    }

    // Small delay to allow DOM to update
    const timer = setTimeout(checkAndLoadMore, 100)
    return () => clearTimeout(timer)
  }, [steps, onLoadMore, isLoadingMore, hasMore, isHorizontal])

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || !onLoadMore || isLoadingMore) return
    const {
      scrollTop,
      scrollHeight,
      clientHeight,
      scrollLeft,
      scrollWidth,
      clientWidth
    } = scrollRef.current

    if (isHorizontal) {
      // Horizontal scroll detection
      if (scrollLeft + clientWidth >= scrollWidth - 50) {
        onLoadMore()
      }
    } else {
      // Vertical scroll detection
      if (scrollTop + clientHeight >= scrollHeight - 50) {
        onLoadMore()
      }
    }
  }, [onLoadMore, isLoadingMore, isHorizontal])

  const timelineElement = (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className={`rounded-xl ${
        isDark ? 'bg-gray-800' : 'bg-white'
      } ${className} ${isHorizontal ? 'overflow-x-auto' : 'overflow-y-auto'}`}
      style={{
        maxHeight: isHorizontal ? undefined : '100%',
        height: isHorizontal ? undefined : '93%'
      }}
    >
      <ol
        className={
          isHorizontal
            ? 'relative flex items-start gap-0 pb-4 scrollbar-thin'
            : 'x scrollbar-none relative'
        }
        style={isHorizontal ? { scrollBehavior: 'smooth' } : undefined}
      >
        {Array.isArray(steps) &&
          steps.map((step, idx) => {
            const isLeft = idx % 2 === 0
            const statusStyles = statusMap[step[status]] || {
              icon: null,
              color: '#d1d5db'
            }
            const _dateVal = step[date]
            const _dateDisplay = getDateDisplay(_dateVal)
            const _timeDisplay = getTimeDisplay(_dateVal)
            return (
              <li
                key={idx}
                className={
                  isHorizontal
                    ? 'hover:color-gray-50 relative flex min-w-[200px] cursor-pointer flex-col items-center rounded transition-all duration-200'
                    : 'relative flex w-full flex-row justify-center'
                }
                onClick={() => onStepClick?.(step, idx)}
              >
                {isHorizontal ? (
                  <>
                    {/* Horizontal Layout */}
                    <div className='mb-4 flex w-full flex-col items-center gap-0.5 px-1 text-center'>
                      <span
                        className={`whitespace-nowrap ${
                          isDark ? 'text-gray-200' : 'text-gray-600'
                        }`}
                      >
                        {_dateDisplay}
                      </span>
                      {_timeDisplay && (
                        <span
                          className={`whitespace-nowrap ${
                            isDark ? 'text-gray-200' : 'text-gray-600'
                          }`}
                        >
                          {_timeDisplay}
                        </span>
                      )}
                    </div>

                    <div className='relative mb-4 flex w-full items-center'>
                      <span
                        className={`relative z-10 mx-auto flex h-8 w-8 items-center justify-center rounded-full border-4 border-white `}
                        style={{ backgroundColor: statusStyles.color }}
                      >
                        {statusStyles.icon && (
                          <Icon
                            data={statusStyles.icon}
                            size={16}
                            className='text-white'
                          />
                        )}
                      </span>

                      {idx !== steps.length - 1 && (
                        <div
                          className='absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2'
                          style={{ backgroundColor: statusStyles.color }}
                        />
                      )}
                    </div>

                    <div className='flex w-full flex-col gap-1 px-1 text-center' style={{ wordBreak: 'keep-all' }}>
                      <Text
                        fillContainer={false}
                        className={` ${
                          isDark ? 'text-gray-200' : 'text-gray-600'
                        }`}
                      >
                        {step[title]}
                      </Text>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Vertical Layout */}
                    <div className='grid w-full grid-cols-[0.50fr_40px_1fr] items-stretch'>
                      {/* Left Side - Date & Time */}
                      <div
                        className="flex flex-wrap items-center justify-end gap-x-1 gap-y-1 py-5 leading-none"
                      >
                        <span className="whitespace-nowrap leading-none">
                          {_dateDisplay}
                        </span>
                        {_timeDisplay && (
                          <span className="whitespace-nowrap leading-none">
                            {_timeDisplay}
                          </span>
                        )}
                      </div>

                      {/* Timeline */}
                      <div className='relative flex items-center justify-center ml-1'>
                        <span
                          className='relative z-10 flex h-6 w-6 items-center justify-center rounded-full'
                          style={{
                            backgroundColor: statusStyles.color
                          }}
                        >
                          {statusStyles.icon && (
                            <Icon
                              data={statusStyles.icon}
                              size={12}
                              fillContainer={false}
                              className='!flex !h-full !w-full !items-center !justify-center text-white'
                            />
                          )}
                        </span>

                        <div
                          className='absolute left-1/2 top-0 -translate-x-1/2 w-0.5 z-0'
                          style={{
                            backgroundColor: statusStyles.color,
                            bottom: idx === steps.length - 1 ? '50%' : '0'
                          }}
                        />
                      </div>

                      {/* Right Side - Title */}
                      <div
                        className={`flex items-center py-5 pl-2 ${
                          isDark ? 'text-gray-200' : 'text-gray-700'
                        }`}
                      >
                        <Text
                          fillContainer={false}
                          className='text-left w-full'
                          style={{
                            wordBreak: 'keep-all',
                            textAlign: 'left'
                          }}
                        >
                          {step[title]}
                        </Text>
                      </div>
                    </div>
                  </>
                )}
              </li>
            )
          })}
        {isLoadingMore && (
          <li
            className={
              isHorizontal
                ? 'flex min-w-[100px] items-center justify-center'
                : 'flex w-full items-center justify-center py-4'
            }
          >
            <div className='h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-500' />
          </li>
        )}
      </ol>
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
      {timelineElement}
    </CommonHeaderAndTooltip>
  )
}
