'use client'
import React, { useState, useContext, useEffect } from 'react'
import { TotalContext, TotalContextProps } from '@/app/globalContext'
import i18n from '@/app/components/i18n'
import { codeExecution } from '@/app/utils/codeExecution'
import { AxiosService } from '@/app/components/axiosService'
import { Tooltip } from './Tooltip'
import {
  ComponentSize,
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
import { useGlobal } from '@/context/GlobalContext'
import { getBorderRadiusClass } from '@/app/utils/branding'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
type ContentAlign = 'center' | 'left' | 'right'
interface TimePickerProps {
  timeType?: 'normal' | 'railway'
  setting?: 'HH:mm' | 'HH:mm:ss'
  label?: string
  state?: string
  setState?: (fn: (prev: any) => any) => void
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  readOnly?: boolean
  disabled?: boolean
  className?: string
  contentAlign?: ContentAlign
  style?: React.CSSProperties
}

const TimePicker: React.FC<TimePickerProps> = ({
  timeType = 'normal',
  setting = 'HH:mm',
  label = '',
  state = '',
  setState = () => {},
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  readOnly = false,
  disabled = false,
  contentAlign = 'center',
  className = '',
  style
}) => {
  const { theme, direction, branding } = useGlobal()
  const [hour, setHour] = useState<string>('00')
  const [minute, setMinute] = useState<string>('00')
  const [second, setSecond] = useState<string>('00')
  const [period, setPeriod] = useState<string>('AM')
  const periods = ['AM', 'PM']

  const [forFirstTime, setForFirstTime] = useState(false)

  const isDark = theme === 'dark' || theme === 'dark-hc'
  const getTextAlignClasses = () => {
    switch (contentAlign) {
      case 'left':
        return 'text-left'
      case 'right':
        return 'text-right'
      case 'center':
        return 'text-center'
      default:
        return 'text-center'
    }
  }
  const setTime = () => {
    let time: any = ''
    if ((timeType = 'normal')) {
      if (period == 'AM') {
        time = `2025-01-23T${hour || '00'}:${minute || '00'}:${second || '00'}Z`
      } else {
        time = `2025-01-23T${parseInt(hour) + 12 || '00'}:${minute || '00'}:${
          second || '00'
        }Z`
      }
    } else {
      time = `2025-01-23T${hour || '00'}:${minute || '00'}:${second || '00'}Z`
    }
    if (forFirstTime) setState((pre: any) => ({ ...pre, [label]: time }))
    setForFirstTime(true)
  }
  useEffect(() => {
    setTime()
  }, [hour, minute, second, period])

  const hours = Array.from({ length: timeType == 'normal' ? 12 : 24 }, (_, i) =>
    String(i).padStart(2, '0')
  )
  const minutes = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  )
  const seconds = Array.from({ length: 60 }, (_, i) =>
    String(i).padStart(2, '0')
  )

  const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setHour(e.target.value)
  }

  const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMinute(e.target.value)
  }

  const handleSecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSecond(e.target.value)
  }

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setPeriod(e.target.value)
  }

  const keyset: any = i18n.keyset('language')

  const timePickerElement = (
    <div
      className={`
        flex h-full w-full flex-col overflow-hidden
        ${
          isDark
            ? 'border-gray-600 bg-gray-800 text-white'
            : 'border-gray-300 bg-white text-gray-900'
        }
      `}
      style={style}
    >
      {label && (
        <label
          className={`mb-0.5 block text-xs font-medium ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      )}
      <div className={`flex min-h-0 flex-1 gap-1 ${className}`}>
        {/* Hour Selector */}
        <div
          className={`
            relative min-h-0 flex-1 border transition-colors focus:outline-none
            ${getBorderRadiusClass(branding.borderRadius)}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            ${readOnly ? 'cursor-default' : ''}
          `}
          onFocus={e => {
            e.currentTarget.style.borderColor = branding.brandColor
            e.currentTarget.style.boxShadow = `0 0 0 1px ${branding.brandColor}20`
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = isDark ? '#4B5563' : '#D1D5DB'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <select
            className={`h-full w-full appearance-none border-none bg-transparent px-2 pr-6 text-sm focus:outline-none ${getTextAlignClasses()} ${
              readOnly ? 'pointer-events-none' : ''
            }`}
            onChange={handleHourChange}
            disabled={disabled}
            value={hour}
          >
            {hours.map(h => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2'>
            ▼
          </span>
        </div>
        {/* Minute Selector */}
        <div
          className={`
            relative min-h-0 flex-1 border transition-colors focus:outline-none
            ${getBorderRadiusClass(branding.borderRadius)}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            ${readOnly ? 'cursor-default' : ''}
            `}
          onFocus={e => {
            e.currentTarget.style.borderColor = branding.brandColor
            e.currentTarget.style.boxShadow = `0 0 0 1px ${branding.brandColor}20`
          }}
          onBlur={e => {
            e.currentTarget.style.borderColor = isDark ? '#4B5563' : '#D1D5DB'
            e.currentTarget.style.boxShadow = 'none'
          }}
        >
          <select
            className={`h-full w-full appearance-none border-none bg-transparent px-2 pr-6 text-sm focus:outline-none ${getTextAlignClasses()} ${
              readOnly ? 'pointer-events-none' : ''
            }`}
            value={minute}
            onChange={handleMinuteChange}
            disabled={disabled}
          >
            {minutes.map(m => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <span className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2'>
            ▼
          </span>
        </div>

        {/* Second Selector */}
        {setting == 'HH:mm:ss' && (
          <div
            className={`
              relative min-h-0 flex-1 border transition-colors focus:outline-none
              ${getBorderRadiusClass(branding.borderRadius)}
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              ${readOnly ? 'cursor-default' : ''}
            `}
            onFocus={e => {
              e.currentTarget.style.borderColor = branding.brandColor
              e.currentTarget.style.boxShadow = `0 0 0 1px ${branding.brandColor}20`
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = isDark ? '#4B5563' : '#D1D5DB'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <select
              className={`h-full w-full appearance-none border-none bg-transparent px-2 pr-6 text-sm focus:outline-none ${getTextAlignClasses()} ${
              readOnly ? 'pointer-events-none' : ''
            }`}
              value={second}
              onChange={handleSecChange}
              disabled={disabled}
            >
              {seconds.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <span className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-sm'>
              ▼
            </span>
          </div>
        )}

        {/* AM/PM Selector */}
        {timeType == 'normal' && (
          <div
            className={`
              relative min-h-0 flex-1 border transition-colors focus:outline-none
              ${getBorderRadiusClass(branding.borderRadius)}
              ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              ${readOnly ? 'cursor-default' : ''}
            `}
            onFocus={e => {
              e.currentTarget.style.borderColor = branding.brandColor
              e.currentTarget.style.boxShadow = `0 0 0 1px ${branding.brandColor}20`
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = isDark ? '#4B5563' : '#D1D5DB'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <select
              className={`h-full w-full appearance-none border-none bg-transparent px-2 pr-6 text-sm focus:outline-none ${getTextAlignClasses()} ${
              readOnly ? 'pointer-events-none' : ''
            }`}
              value={period}
              onChange={handlePeriodChange}
              disabled={disabled}
            >
              {periods.map(p => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <span className='pointer-events-none absolute right-2 top-1/2 -translate-y-1/2'>
              ▼
            </span>
          </div>
        )}
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
    >
      {timePickerElement}
    </CommonHeaderAndTooltip>
  )
}
export default TimePicker