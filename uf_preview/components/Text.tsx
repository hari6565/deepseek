'use client'

import React from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { Icon } from './Icon'
import { Tooltip } from './Tooltip'
import { TooltipProps as TooltipPropsType } from '@/types/global'
import { getBorderRadiusClass } from '@/app/utils/branding'
export type TextVariant =
  | 'display-4'
  | 'display-3'
  | 'display-2'
  | 'display-1'
  | 'header-2'
  | 'header-1'
  | 'subheader-3'
  | 'subheader-2'
  | 'subheader-1'
  | 'body-3'
  | 'body-2'
  | 'body-1'
  | 'body-short'
  | 'caption-2'
  | 'caption-1'
  | 'code-3'
  | 'code-inline-3'
  | 'code-2'
  | 'code-inline-2'
  | 'code-1'
  | 'code-inline-1'

type WordBreak = 'break-all' | 'break-word'
type WhiteSpace = 'nowrap' | 'break-spaces'
type TextColor =
  | 'primary'
  | 'complementary'
  | 'secondary'
  | 'hint'
  | 'info'
  | 'info-heavy'
  | 'positive'
  | 'positive-heavy'
  | 'warning'
  | 'warning-heavy'
  | 'danger'
  | 'danger-heavy'
  | 'utility'
  | 'utility-heavy'
  | 'misc'
  | 'misc-heavy'
  | 'brand'
  | 'link'
  | 'link-hover'
  | 'link-visited'
  | 'link-visited-hover'
  | 'dark-primary'
  | 'dark-complementary'
  | 'dark-secondary'
  | 'light-primary'
  | 'light-complementary'
  | 'light-secondary'
  | 'light-hint'
  | 'inverted-primary'
  | 'inverted-complementary'
  | 'inverted-secondary'
  | 'inverted-hint'

type IconDisplay = 'Icon only' | 'Start with Icon' | 'End with Icon'
type contentAlign = 'right' | 'center' | 'left'
interface TextProps {
  variant?: TextVariant
  wordBreak?: WordBreak
  color?: TextColor
  static?: boolean
  iconDisplay?: IconDisplay
  icon?: string
  whitespace?: WhiteSpace
  iconSize?: number
  content?: string
  children?: React.ReactNode
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  className?: string
  style?: React.CSSProperties
  fillContainer?: boolean
  contentAlign?: contentAlign
}

export const Text: React.FC<TextProps> = ({
  variant,
  wordBreak,
  color = '',
  static: isStatic = false,
  iconDisplay,
  icon,
  whitespace,
  iconSize = 16,
  content,
  children,
  needTooltip = false,
  tooltipProps,
  className = '',
  style,
  fillContainer = true,
  contentAlign = 'center'
}) => {
  const { theme, direction } = useGlobal()

  const getVariantClasses = (): string => {
    if (!variant) {
      return ""
    }
    switch (variant) {
      case 'display-4':
        return 'text-[clamp(30px,4.167vw,60px)] font-bold'
      case 'display-3':
        return 'text-[clamp(24px,3.333vw,48px)] font-bold'
      case 'display-2':
        return 'text-[clamp(20px,2.5vw,36px)] font-bold'
      case 'display-1':
        return 'text-[clamp(18px,2.083vw,30px)] font-bold'
      case 'header-2':
        return 'text-[clamp(16px,1.667vw,24px)] font-semibold'
      case 'header-1':
        return 'text-[clamp(14px,1.389vw,20px)] font-semibold'
      case 'subheader-3':
        return 'text-[clamp(13px,1.25vw,18px)] font-medium'
      case 'subheader-2':
        return 'text-[clamp(12px,1.111vw,16px)] font-medium'
      case 'subheader-1':
        return 'text-[clamp(11px,0.972vw,14px)] font-medium'
      case 'body-3':
        return 'text-[clamp(13px,1.25vw,18px)]'
      case 'body-2':
        return 'text-[clamp(12px,1.111vw,16px)]'
      case 'body-1':
        return 'text-[clamp(11px,0.972vw,14px)]'
      case 'body-short':
        return 'text-[clamp(11px,0.972vw,14px)]'
      case 'caption-2':
        return 'text-[clamp(10px,0.833vw,12px)]'
      case 'caption-1':
        return 'text-[clamp(10px,0.833vw,12px)] opacity-75'
      case 'code-3':
      case 'code-inline-3':
        return 'text-[clamp(13px,1.25vw,18px)] font-mono'
      case 'code-2':
      case 'code-inline-2':
        return 'text-[clamp(12px,1.111vw,16px)] font-mono'
      case 'code-1':
      case 'code-inline-1':
        return 'text-[clamp(11px,0.972vw,14px)] font-mono'
      default:
        return 'text-[clamp(12px,1.111vw,16px)]'
    }
  }

  const getColorStyle = (): string => {
    const isDark = theme === 'dark' || theme === 'dark-hc'

    const colorMap: Record<TextColor, string> = {
      primary: isDark ? '#F9FAFB' : '#111827',
      complementary: isDark ? '#E5E7EB' : '#374151',
      secondary: isDark ? '#D1D5DB' : '#6B7280',
      hint: isDark ? '#9CA3AF' : '#9CA3AF',
      info: isDark ? '#60A5FA' : '#3B82F6',
      'info-heavy': isDark ? '#3B82F6' : '#1E40AF',
      positive: isDark ? '#4ADE80' : '#22C55E',
      'positive-heavy': isDark ? '#22C55E' : '#166534',
      warning: isDark ? '#FBBF24' : '#F59E0B',
      'warning-heavy': isDark ? '#F59E0B' : '#854D0E',
      danger: isDark ? '#F87171' : '#EF4444',
      'danger-heavy': isDark ? '#EF4444' : '#991B1B',
      utility: isDark ? '#A78BFA' : '#8B5CF6',
      'utility-heavy': isDark ? '#8B5CF6' : '#6D28D9',
      misc: isDark ? '#9CA3AF' : '#6B7280',
      'misc-heavy': isDark ? '#6B7280' : '#374151',
      brand: 'var(--brand-color)',
      link: '#3B82F6',
      'link-hover': '#2563EB',
      'link-visited': '#7C3AED',
      'link-visited-hover': '#6D28D9',
      'dark-primary': '#F9FAFB',
      'dark-complementary': '#E5E7EB',
      'dark-secondary': '#D1D5DB',
      'light-primary': '#111827',
      'light-complementary': '#374151',
      'light-secondary': '#6B7280',
      'light-hint': '#9CA3AF',
      'inverted-primary': isDark ? '#111827' : '#F9FAFB',
      'inverted-complementary': isDark ? '#374151' : '#E5E7EB',
      'inverted-secondary': isDark ? '#6B7280' : '#D1D5DB',
      'inverted-hint': '#9CA3AF'
    }

    return colorMap[color as TextColor] || ''
  }

  const displayContent = content || children

  const renderContent = (): React.ReactNode => {
    if (iconDisplay === 'Icon only' && icon) {
      return (
        <Icon
          fillContainer={false}
          data={icon}
          size={iconSize}
          className={`flex items-center justify-center ${className}`}
        />
      )
    }

if (iconDisplay === 'Start with Icon' && icon) {
  return (
    <span className="inline-flex items-center gap-1 leading-none">
      <Icon
        fillContainer={false}
        data={icon}
        size={iconSize}
        className="flex-shrink-0"
      />
      <span className="leading-none">{displayContent}</span>
    </span>
  )
}

if (iconDisplay === 'End with Icon' && icon) {
  return (
    <span className="inline-flex items-center gap-1 leading-none">
      <span className="leading-none">{displayContent}</span>
      <Icon
        fillContainer={false}
        data={icon}
        size={iconSize}
        className="flex-shrink-0"
      />
    </span>
  )
}

    return displayContent
  }
  const getFillClasses = (): string => {
    if (!fillContainer) return ''
    return 'w-full h-full'
  }

  const getContentAlignClasses = (): string => {
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

  const textElement = (
    <div
      className={`
        ${fillContainer}
        ${getVariantClasses()}
        ${getFillClasses()}
        ${getContentAlignClasses()}
        overflow-hidden
        ${
          wordBreak === 'break-all'
            ? 'break-all'
            : wordBreak === 'break-word'
            ? 'break-words'
            : ''
        }
        ${
          whitespace === 'nowrap'
            ? 'whitespace-nowrap'
            : whitespace === 'break-spaces'
            ? 'whitespace-break-spaces'
            : ''
        }
        ${iconDisplay && icon ? `inline-flex items-center` : ''}
        ${className}
      `}
      dir={direction}
      style={{
        color: getColorStyle(),
        ...style
      }}
    >
      {renderContent()}
    </div>
  )

  if (needTooltip && tooltipProps) {
    return (
      <Tooltip
        title={tooltipProps.title}
        placement={tooltipProps.placement}
        triggerClassName=''
      >
        {textElement}
      </Tooltip>
    )
  }

  return textElement
}  