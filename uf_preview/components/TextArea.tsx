'use client'

import React, { useState, useEffect } from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { useInfoMsg } from "@/app/components/infoMsgHandler";
import { Tooltip } from './Tooltip'
import {
  ComponentSize,
  TextAreaPin,
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
import { getBorderRadiusClass } from '@/app/utils/branding'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
type ContentAlign = 'left' | 'right' | 'center'

// Exact stroke colors - single source of truth for every border state
const STROKE = {
  light: '#E5E5E5',
  dark: '#484848',
  invalid: '#EF4444',
  valid: '#10B981'
} as const

const getDefaultStroke = (isDark: boolean) => (isDark ? STROKE.dark : STROKE.light)
interface TextAreaProps {
  disabled?: boolean
  pin?: TextAreaPin
  placeholder?: string
  readOnly?: boolean
  value?: string
  validationState?: 'valid' | 'invalid'
  errorMessage?: string
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  require?: boolean
  onChange?: (value: any) => void
  onBlur?: (value: any) => void
  onFocus?: (value: any) => void
  className?: string
  fillContainer?: boolean
  contentAlign?: ContentAlign
}

export const TextArea: React.FC<TextAreaProps> = ({
  disabled = false,
  pin = '',
  placeholder,
  readOnly = false,
  value = '',
  validationState,
  errorMessage,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  require = false,
  onChange,
  onBlur,
  onFocus,
  className = '',
  fillContainer = true,
  contentAlign = 'left'
}) => {
  const { theme, direction, branding } = useGlobal()
  const [internalValue, setInternalValue] = useState(value)
  const showToast = useInfoMsg()

  useEffect(() => {
    if (validationState === 'invalid' && errorMessage) {
      showToast(errorMessage, 'danger')
    }
  }, [validationState, errorMessage])

  const getFillClasses = () => {
    if (!fillContainer) return ''
    return 'w-full h-full'
  }

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

  const getPinClasses = () => {
    if (!pin) return '[border-radius:var(--border-radius)]'
    const baseRadius = getBorderRadiusClass(branding.borderRadius)

    if (pin === 'clear-clear') {
      return baseRadius
    }

    const [left, right] = pin.split('-')
    const leftRadius =
      left === 'round'
        ? 'rounded-l-2xl'
        : left === 'brick'
        ? 'rounded-l-none'
        : `rounded-l${baseRadius.replace('rounded', '')}`
    const rightRadius =
      right === 'round'
        ? 'rounded-r-2xl'
        : right === 'brick'
        ? 'rounded-r-none'
        : `rounded-r${baseRadius.replace('rounded', '')}`

    return `${leftRadius} ${rightRadius}`
  }

  const isDark = theme === 'dark' || theme === 'dark-hc'

  const getInputStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {}

    if (validationState === 'invalid' || errorMessage) {
      styles.borderColor = STROKE.invalid
    } else if (validationState === 'valid') {
      styles.borderColor = STROKE.valid
    } else {
      styles.borderColor = getDefaultStroke(isDark)
    }

    return styles
  }

  const textAreaElement = (
    <div
      className={`${getFillClasses()} `}
    >
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`
          ${getFillClasses()}
          ${getPinClasses()}
          ${getTextAlignClasses()}
          border
          ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          ${
            isDark
              ? 'bg-gray-800 text-white'
              : 'bg-white text-gray-900'
          }
          p-2 transition-all duration-200
          focus:outline-none

          ${className}
        `}
        style={{
          fontFamily: 'var(--font-body)',
          ...getInputStyles()
        }}
        onMouseEnter={e => {
          if (
            !disabled &&
            !readOnly &&
            !errorMessage &&
            !validationState &&
            document.activeElement !== e.currentTarget
          ) {
            e.currentTarget.style.borderColor = branding.hoverColor
          }
        }}
        onMouseLeave={e => {
          if (
            !disabled &&
            !readOnly &&
            !errorMessage &&
            !validationState &&
            document.activeElement !== e.currentTarget
          ) {
            e.currentTarget.style.borderColor = getDefaultStroke(isDark)
          }
        }}
        onFocus={e => {
          if (!errorMessage && !validationState) {
            e.currentTarget.style.borderColor = branding.selectionColor
            e.currentTarget.style.boxShadow = 'none'
          }
          onFocus?.(e)
        }}
        onBlur={e => {
          if (!errorMessage && !validationState) {
            e.currentTarget.style.borderColor = getDefaultStroke(isDark)
            e.currentTarget.style.boxShadow = 'none'
          }
          onBlur?.(e)
        }}
      />
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
      required={require}
    >
      {textAreaElement}
    </CommonHeaderAndTooltip>
  )
}
