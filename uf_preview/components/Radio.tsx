'use client'

import React from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
type ContentAlign = 'left' | 'center' | 'right'
interface RadioProps {
  checked?: boolean
  disabled?: boolean
  content?: string
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  value?: string
  name?: string
  className?: string
  fillContainer?: boolean
  contentAlign?: ContentAlign
  onClick?: (checked: boolean) => void
  onChange?: (value: string) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export const Radio: React.FC<RadioProps> = ({
  checked,
  disabled = false,
  content,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  value = '',
  name,
  className = '',
  fillContainer = true,
  contentAlign = 'left',
  onChange,
  onBlur,
  onFocus,
  onClick
}) => {
  const { theme, direction } = useGlobal()
  const isDark = theme === 'dark' || theme === 'dark-hc'
  const getFillClasses = (): string => {
    if (!fillContainer) return ''
    return 'w-full h-full'
  }
  const getContentAlignClasses = (): string => {
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
  const getRadioStyles = (): React.CSSProperties => {
    const isDark = theme === 'dark' || theme === 'dark-hc'

    if (disabled && checked) {
      return {
        backgroundColor: 'var(--selection-color)',
        borderColor: 'var(--selection-color)',
        borderWidth: '2px',
        boxShadow: 'inset 0 0 0 5px white',
        opacity: 0.5
      }
    }

    if (disabled) {
      return {
        backgroundColor: isDark ? '#374151' : '#E5E7EB',
        borderColor: isDark ? '#4B5563' : '#D1D5DB'
      }
    }

    if (checked) {
      return {
        backgroundColor: 'var(--selection-color)',
        borderColor: 'var(--selection-color)',
        borderWidth: '2px',
        boxShadow: 'inset 0 0 0 5px white'
      }
    }

    return {
      backgroundColor: isDark ? '#1F2937' : 'white',
      borderColor: isDark ? '#4B5563' : '#D1D5DB',
      borderWidth: '2px'
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled) {
      e.preventDefault()
      onClick?.(!checked)
      onChange?.(value)
    }
  }

  const radioElement = (
    <label
      className={`
        ${fillContainer ? 'flex' : 'inline-flex'} 
        items-center 
        ${getContentAlignClasses()} 
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'} 
        ${getFillClasses()} ${fillContainer ? 'overflow-hidden' : ''}
      `}
      onClick={handleClick}
    >
      <input
        type='radio'
        checked={checked}
        disabled={disabled}
        name={name}
        value={value}
        onChange={() => onChange?.(value)}
        onBlur={onBlur}
        onFocus={onFocus}
        className='sr-only'
      />
      <div
        style={getRadioStyles()}
        className={`
          aspect-square h-full
          flex-shrink-0  rounded-full border transition-all
        `}
        onMouseEnter={e => {
          if (!disabled && !checked) {
            e.currentTarget.style.borderColor = 'var(--hover-color)'
          }
        }}
        onMouseLeave={e => {
          if (!disabled && !checked) {
            const isDark = theme === 'dark' || theme === 'dark-hc'
            e.currentTarget.style.borderColor = isDark ? '#4B5563' : '#D1D5DB'
          }
        }}
      />
      {content && (
        <span
          className={`${direction === 'RTL' ? 'mr-2' : 'ml-2'} ${
            theme === 'dark' || theme === 'dark-hc'
              ? 'text-gray-200'
              : 'text-gray-900'
          } ${fillContainer ? 'overflow-hidden ' : ''}`}
        >
          {content}
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
      {radioElement}
    </CommonHeaderAndTooltip>
  )
}