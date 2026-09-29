
'use client'
import React, { useMemo, useState } from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
import { HeaderPosition, TooltipProps as TooltipPropsType } from '@/types/global'
import { getBorderRadiusClass } from '@/app/utils/branding'

interface XMLViewerProps {
  data?: string
  className?: string
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  fillContainer?: boolean
}

const XMLViewer: React.FC<XMLViewerProps> = ({
  data = "",
  className = "",
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  fillContainer = true,
}) => {
  const { theme, branding } = useGlobal()
  const [copied, setCopied] = useState(false)
  const isDark = theme === 'dark' || theme === 'dark-hc'
  const borderRadiusClass = getBorderRadiusClass(branding.borderRadius)

  const formatXml = (xml: string): string => {
    let formatted = ''
    let indent = 0
    const tab = '    '

    // Remove existing whitespace between tags
    const trimmed = xml.replace(/>\s+</g, '><').trim()

    trimmed.split(/(<[^>]+>)/g).forEach((node) => {
      if (!node.trim()) return

      // Closing tag
      if (node.match(/^<\/\w/)) {
        indent--
        formatted += tab.repeat(Math.max(0, indent)) + node + '\n'
      }
      // Self-closing tag or processing instruction (<?xml ... ?>)
      else if (node.match(/\/>$/) || node.match(/^<\?.*\?>$/)) {
        formatted += tab.repeat(indent) + node + '\n'
      }
      // Opening tag
      else if (node.match(/^<\w/)) {
        formatted += tab.repeat(indent) + node + '\n'
        indent++
      }
      // Text content
      else {
        formatted += tab.repeat(indent) + node + '\n'
      }
    })

    // Clean up: merge text nodes back onto their parent line
    // e.g. "<tag>\n    text\n</tag>" => "<tag>text</tag>"
    formatted = formatted.replace(
      /(<[^/][^>]*>)\n\s*([^<\s][^<]*)\n\s*(<\/[^>]+>)/g,
      '$1$2$3'
    )

    return formatted.trim()
  }

  const xmlString = useMemo(() => {
    let cleaned = data
    if (cleaned.startsWith('"') && cleaned.endsWith('"')) {
      cleaned = cleaned.slice(1, -1)
    }
    cleaned = cleaned.replace(/\\"/g, '"').replace(/\\n/g, '\n')
    return formatXml(cleaned)
  }, [data])

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const viewerElement = (
    <div className={`${fillContainer ? 'w-full h-full' : ''} `}>
      <div
        className={`${fillContainer ? 'h-full' : ''} relative ${borderRadiusClass} overflow-hidden`}
        style={{
          backgroundColor: isDark ? '#1F2937' : '#F5F5F5',
          border: `1px solid ${isDark ? '#374151' : '#E5E7EB'}`,
        }}
      >
        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="absolute top-2 right-2 p-1.5 rounded-md transition-colors duration-200"
          style={{
            color: isDark ? '#9CA3AF' : '#6B7280',
            backgroundColor: 'transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? '#374151' : '#E5E7EB'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>

        {/* XML Content */}
        <pre
          className="overflow-y-auto overflow-x-auto p-4 pr-10 text-sm leading-relaxed font-mono m-0 max-h-96"
          style={{
            color: isDark ? '#E5E7EB' : '#1F2937',
          }}
        >
          {xmlString}
        </pre>
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
      {viewerElement}
    </CommonHeaderAndTooltip>
  )
}

export default XMLViewer
