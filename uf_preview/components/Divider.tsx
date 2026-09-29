'use client'

import React from 'react'

type DividerDirection = 'horizontal' | 'vertical'
type DividerPosition = 'start' | 'middle' | 'end'

interface DividerProps {
  direction?: DividerDirection
  position?: DividerPosition
  thickness?: number
  color?: string
  borderRadius?: number
  className?: string
}

export const Divider: React.FC<DividerProps> = ({
  direction = 'horizontal',
  position = 'middle',
  thickness = 1,
  color = '#E5E7EB',
  borderRadius = 5,
  className = '',
}) => {
  const isHorizontal = direction === 'horizontal'

  const alignMap = {
    start: 'flex-start',
    middle: 'center',
    end: 'flex-end',
  } as const

  // Wrapper uses flexbox to position the line within the container
  // Horizontal: column flex to place line at top/center/bottom
  // Vertical: row flex to place line at left/center/right
  const wrapperStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'column' : 'row',
    justifyContent: alignMap[position],
    width: '100%',
    height: '100%',
  }

  const lineStyle: React.CSSProperties = {
    width: isHorizontal ? '100%' : `${thickness}px`,
    height: isHorizontal ? `${thickness}px` : '100%',
    backgroundColor: color,
    borderRadius: `${borderRadius}px`,
    flexShrink: 0,
  }

  return (
    <div style={wrapperStyle} className={`flex-shrink-0 ${className}`}>
      <div style={lineStyle} />
    </div>
  )
}
