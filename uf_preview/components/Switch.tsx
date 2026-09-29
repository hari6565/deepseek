'use client'

import React from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { Tooltip } from './Tooltip'
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'

type ContentAlign = 'left' | 'center' | 'right'

interface SwitchProps {
  checked: boolean
  disabled?: boolean
  content?: string
  checkedContent?: string
  uncheckedContent?: string
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  onChange?: (checked: boolean) => void
  className?: string
  fillContainer?: boolean
  contentAlign?: ContentAlign
}

export const Switch: React.FC<SwitchProps> = ({
  checked,
  disabled = false,
  content,
  checkedContent,
  uncheckedContent,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  onChange,
  className = '',
  fillContainer = true,
  contentAlign = 'center'
}) => {
  const { theme, direction } = useGlobal()

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

  const getSwitchStyles = (): React.CSSProperties => {
    const isDark = theme === 'dark' || theme === 'dark-hc'

    if (disabled) {
      return {
        backgroundColor: isDark ? '#374151' : '#E5E7EB',
        opacity: 0.5
      }
    }

    if (checked) {
      return {
        backgroundColor: 'var(--selection-color)'
      }
    }

    return {
      backgroundColor: isDark ? '#4B5563' : '#D1D5DB'
    }
  }

  const getTranslateClass = () => {
    return checked ? 'translate-x-[calc(100%_+_6px)]' : 'translate-x-0.5'
  }
  const switchElement = (
    <label
      className={`
        ${fillContainer ? 'flex' : 'inline-flex'} items-center 
        ${getContentAlignClasses()} 
        ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} 
        ${getFillClasses()} ${fillContainer ? 'overflow-hidden' : ''}
        ${className} 
      `}
    >
      <div
        className={`relative aspect-[2/1] h-full flex-shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1`}
        style={getSwitchStyles()}
        onClick={() => !disabled && onChange?.(!checked)}
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return
          if (e.key === ' ' || e.key === 'Spacebar' || e.key === 'Enter') {
            e.preventDefault()
            onChange?.(!checked)
          }
        }}
      >
        <div
          className={`absolute top-0.5 aspect-square h-[calc(100%-4px)] transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${getTranslateClass()}`}
        />
      </div>
      {(content || checkedContent || uncheckedContent) && (
        <span
          className={`${direction === 'RTL' ? 'mr-3' : 'ml-3'} ${
            theme === 'dark' || theme === 'dark-hc'
              ? 'text-gray-200'
              : 'text-gray-900'
          } ${disabled ? 'opacity-50' : ''} ${
            fillContainer
              ? 'overflow-hidden text-ellipsis whitespace-nowrap'
              : ''
          }`}
          style={{ fontSize: 'var(--font-size)' }}
        >
            {checkedContent || uncheckedContent
            ? checked
              ? checkedContent
              : uncheckedContent
            : content}
        </span>
      )}
    </label>
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
      {switchElement}
    </CommonHeaderAndTooltip>
  )
}