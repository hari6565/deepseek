'use client'

import React from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { Tooltip } from './Tooltip'
import { Icon } from './Icon'
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
import { getBorderRadiusClass } from '@/app/utils/branding'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
type IconDisplay = 'Icon only' | 'Start with Icon' | 'End with Icon'
type LabelTheme =
  | 'normal'
  | 'info'
  | 'danger'
  | 'warning'
  | 'success'
  | 'utility'
  | 'unknown'
  | 'clear'
type ContentAlign = 'left' | 'center' | 'right'

interface LabelProps {
  theme?: LabelTheme
  interactive?: boolean
  copy?: boolean
  copyText?: string
  disabled?: boolean
  icon?: string
  iconSize?: number
  iconDisplay?: IconDisplay
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  children?: React.ReactNode
  onClick?: (e: any) => void
  className?: string
  fillContainer?: boolean
  contentAlign?: ContentAlign
}

export const Label: React.FC<LabelProps> = ({
  theme: labelTheme,
  interactive = false,
  copy = false,
  copyText,
  disabled = false,
  icon,
  iconSize = 16,
  iconDisplay,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  children,
  onClick = () => {},
  className = '',
  fillContainer = true,
  contentAlign = 'center'
}) => {
  const { theme, direction } = useGlobal()
  const handleCopy = () => {
    if (copy) {
      const textToCopy = copyText || (children ? children.toString() : '')
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy)
      }
    }
  }

  const getFillClasses = () => {
    if (!fillContainer) return ''
    return 'w-full h-full'
  }

  const getContentAlignClasses = () => {
    switch (contentAlign) {
      case 'left':
        return 'text-left justify-start'
      case 'right':
        return 'text-right justify-end'
      case 'center':
      default:
        return 'text-center justify-center'
    }
  }

  const getThemeColors = () => {
    const isDark = theme === 'dark' || theme === 'dark-hc'

    switch (labelTheme) {
      case 'info':
        return {
          bg: isDark ? '#1E3A8A' : '#DBEAFE',
          text: isDark ? '#BFDBFE' : '#1E40AF'
        }
      case 'danger':
        return {
          bg: isDark ? '#991B1B' : '#FEE2E2',
          text: isDark ? '#FECACA' : '#991B1B'
        }
      case 'warning':
        return {
          bg: isDark ? '#854D0E' : '#FEF3C7',
          text: isDark ? '#FDE68A' : '#854D0E'
        }
      case 'success':
        return {
          bg: isDark ? '#166534' : '#DCFCE7',
          text: isDark ? '#BBF7D0' : '#166534'
        }
      case 'utility':
        return {
          bg: isDark ? '#374151' : '#F3F4F6',
          text: isDark ? '#D1D5DB' : '#374151'
        }
      case 'unknown':
        return {
          bg: isDark ? '#4B5563' : '#E5E7EB',
          text: isDark ? '#9CA3AF' : '#6B7280'
        }
      case 'clear':
        return { bg: 'transparent', text: isDark ? '#F9FAFB' : '#111827' }
      default:
        return {
          bg: isDark ? '#1F2937' : '#F3F4F6',
          text: isDark ? '#F9FAFB' : '#111827'
        }
    }
  }

  const colors = getThemeColors()
  const isDark = theme === 'dark' || theme === 'dark-hc'

  const labelElement = (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
          flex
          items-center gap-1 overflow-hidden px-2 py-1 font-medium transition-all
          ${fillContainer ? 'flex' : 'inline-flex'} 
          ${
            disabled
              ? 'cursor-not-allowed opacity-50'
              : interactive
              ? 'cursor-pointer hover:opacity-80'
              : ''
          }
          ${getFillClasses()}
          ${getContentAlignClasses()}
          ${className}
        `}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderRadius: 'var(--border-radius)'
      }}
    >
        {icon && iconDisplay === 'Icon only' && (
          <Icon data={icon} fillContainer={false}  className={`${className}`} />
        )}
        {icon && iconDisplay === 'Start with Icon' && (
          <Icon data={icon} fillContainer={false}  className={`${className}`} />
        )}
        {iconDisplay !== 'Icon only' && (
          <span className='overflow-hidden text-ellipsis whitespace-nowrap'>
            {children}
          </span>
        )}
        {icon && iconDisplay === 'End with Icon' && (
          <Icon data={icon} fillContainer={false} className={`${className}`} />
        )}
        {icon && !iconDisplay && (
          <Icon data={icon} fillContainer={false} className={`${className}`} />
        )}
      <div className='flex !h-full  items-center justify-end'>
        {copy && (
          <Icon
            data='FaCopy'
            fillContainer={false}
            onClick={(e: any) => {
              e.stopPropagation()
              handleCopy()
            }}
            className='cursor-pointer'
          />
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
           fillContainer={fillContainer}
         >
           {labelElement}
         </CommonHeaderAndTooltip>
       )
}