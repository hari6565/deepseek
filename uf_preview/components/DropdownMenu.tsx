'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { useEventBus } from '@/context/EventBusContext'
import { ComponentSize, ComponentEvents } from '@/types/global'
import { getBorderRadiusClass } from '@/app/utils/branding'
import { IoChevronBackOutline, IoChevronForward } from 'react-icons/io5'

export interface DropdownMenuItem {
  text: string
  action?: () => void
  icon?: string
  disabled?: boolean
  items?: DropdownMenuItem[] // For nested menus
  divider?: boolean // Show divider before this item
}

interface DropdownMenuProps {
  nodeId?: any
  renderSwitcher: (props: DropdownSwitcherProps) => React.ReactNode
  items: DropdownMenuItem[]
  popupProps?: {
    style?: React.CSSProperties
    className?: string
  }
  size?: ComponentSize
  disabled?: boolean
  events?: ComponentEvents[]
  className?: string
  onOpenChange?: (open: boolean) => void
  useBrandColor?: boolean // Apply brand color to hover states
}

export interface DropdownSwitcherProps {
  onClick: () => void
  ref: React.RefObject<HTMLElement>
  'aria-expanded': boolean
  'aria-haspopup': boolean
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  nodeId,
  renderSwitcher,
  items,
  popupProps = {},
  size = 'm',
  disabled = false,
  events = [],
  className = '',
  onOpenChange,
  useBrandColor = true
}) => {
  const { theme, direction, branding } = useGlobal()
  const { emit, subscribe, subscribeGlobal } = useEventBus()
  const [isOpen, setIsOpen] = useState(false)

  /**
   * IMPORTANT:
   *
   * Instead of keeping only one active submenu index,
   * we keep the complete submenu path.
   *
   * Example:
   *
   * [0]
   *   -> Administration
   *
   * [0, 1]
   *   -> Administration
   *      -> Risk Management
   *
   * [0, 1, 2]
   *   -> Administration
   *      -> Risk Management
   *         -> Some child
   */
  const [activePath, setActivePath] = useState<number[]>([])

  const dropdownRef = useRef<HTMLDivElement>(null)
  const switcherRef = useRef<HTMLElement>(null)

  const isDark = theme === 'dark' || theme === 'dark-hc'
  const isHighContrast = theme === 'light-hc' || theme === 'dark-hc'

  // ---------------------------------------------------------------------------
  // Event listeners
  // ---------------------------------------------------------------------------

  const handleEventAction = useCallback(
    (eventKey: string, payload: any) => {
      console.log(`DropdownMenu ${nodeId} received event:`, eventKey, payload)

      switch (eventKey) {
        case 'openDropdown':
          setIsOpen(true)
          break

        case 'closeDropdown':
          setIsOpen(false)
          setActivePath([])
          break

        case 'toggleDropdown':
          setIsOpen(prev => !prev)
          setActivePath([])
          break

        default:
          console.log(`Unhandled event action: ${eventKey}`)
      }
    },
    [nodeId]
  )

  useEffect(() => {
    if (!events || events.length === 0) return

    const unsubscribers: (() => void)[] = []

    events.forEach(event => {
      if (!event.enabled || !event.riseListen) {
        return
      }

      event.riseListen.forEach(listener => {
        if (listener.listenerType === 'type1') {
          const unsubscribe = subscribeGlobal(listener.key, payload => {
            handleEventAction(listener.key, payload)
          })

          unsubscribers.push(unsubscribe)
        }

        if (listener.listenerType === 'type2') {
          const unsubscribe = subscribe(listener.key, nodeId, payload => {
            handleEventAction(listener.key, payload)
          })

          unsubscribers.push(unsubscribe)
        }
      })
    })

    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe())
    }
  }, [nodeId, events, subscribe, subscribeGlobal, handleEventAction])

  // ---------------------------------------------------------------------------
  // Close when clicking outside
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
        setActivePath([])
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // ---------------------------------------------------------------------------
  // Escape key
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isOpen) {
      return
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setActivePath([])
      }
    }

    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  // ---------------------------------------------------------------------------
  // Open state notification
  // ---------------------------------------------------------------------------

  useEffect(() => {
    onOpenChange?.(isOpen)

    const openEvent = events.find(event => event.name === 'onOpenChange')

    if (openEvent && openEvent.enabled && openEvent.rise) {
      openEvent.rise.forEach(riseConfig => {
        emit(riseConfig.key, {
          nodeId,
          data: {
            open: isOpen
          }
        })
      })
    }
  }, [isOpen, onOpenChange, events, emit, nodeId])

  // ---------------------------------------------------------------------------
  // Toggle dropdown
  // ---------------------------------------------------------------------------

  const toggleDropdown = useCallback(() => {
    if (disabled) {
      return
    }

    setIsOpen(prev => !prev)

    // Reset nested menus whenever the root dropdown
    // is opened/closed.
    setActivePath([])

    const clickEvent = events.find(event => event.name === 'onClick')

    if (clickEvent && clickEvent.enabled && clickEvent.rise) {
      clickEvent.rise.forEach(riseConfig => {
        emit(riseConfig.key, {
          nodeId,
          data: {
            action: 'toggle'
          }
        })
      })
    }
  }, [disabled, events, emit, nodeId])

  // ---------------------------------------------------------------------------
  // Handle menu item click
  // ---------------------------------------------------------------------------

  const handleItemClick = useCallback((item: DropdownMenuItem) => {
    if (item.disabled) {
      return
    }

    if (item.action) {
      item.action()
    }

    // Leaf item -> close entire dropdown
    if (!item.items || item.items.length === 0) {
      setIsOpen(false)
      setActivePath([])
    }
  }, [])

  // ---------------------------------------------------------------------------
  // Change active submenu
  // ---------------------------------------------------------------------------

  const handleSubmenuClick = useCallback((index: number, level: number) => {
    setActivePath(previousPath => {
      const currentIndex = previousPath[level]

      // Clicking the currently active item
      // closes that submenu and everything below it.
      if (currentIndex === index) {
        return previousPath.slice(0, level)
      }

      /**
       * Keep all parent selections and replace
       * the current level.
       *
       * Example:
       *
       * previous:
       * [0, 1, 2]
       *
       * click level 1, index 3:
       *
       * result:
       * [0, 3]
       *
       * Level 2 is automatically removed.
       */
      return [...previousPath.slice(0, level), index]
    })
  }, [])

  // ---------------------------------------------------------------------------
  // Popup styles
  // ---------------------------------------------------------------------------

  const getPopupStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: isDark ? '#1f2937' : '#ffffff',

      color: isDark ? '#ffffff' : '#000000',

      borderColor: isDark ? '#4B5563' : '#D1D5DB'
    }

    return {
      ...baseStyles,
      ...popupProps.style
    }
  }

  // ---------------------------------------------------------------------------
  // Popup classes
  // ---------------------------------------------------------------------------

  const getPopupClasses = () => {
    const borderRadius = getBorderRadiusClass(branding.borderRadius)

    return `
      absolute
      z-50
      mt-2
      min-w-[160px]
      shadow-lg
      border
      rounded-md
      ${borderRadius}
      ${isDark ? 'border-gray-600' : 'border-gray-300'}
      ${isHighContrast ? 'border-2' : 'border'}
      ${popupProps.className || ''}
    `
  }

  // ---------------------------------------------------------------------------
  // Item classes
  // ---------------------------------------------------------------------------

  const getItemClasses = (item: DropdownMenuItem) => {
    const baseClasses = `
      flex
      items-center
      justify-between
      px-4
      py-2
      cursor-pointer
      rounded-md
      transition-colors
      duration-150
    `

    const disabledClasses = item.disabled ? 'opacity-50 cursor-not-allowed' : ''

    const hoverClasses = item.disabled
      ? ''
      : isDark
      ? 'hover:bg-gray-700'
      : 'hover:bg-gray-100'

    return `
      ${baseClasses}
      ${disabledClasses}
      ${hoverClasses}
    `
  }

  // ---------------------------------------------------------------------------
  // Contrast color
  // ---------------------------------------------------------------------------

  const getContrastColor = (hexColor: string): string => {
    const hex = hexColor.replace('#', '')

    const r = parseInt(hex.substring(0, 2), 16)

    const g = parseInt(hex.substring(2, 4), 16)

    const b = parseInt(hex.substring(4, 6), 16)

    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

    return luminance > 0.5 ? '#000000' : '#FFFFFF'
  }

  // ---------------------------------------------------------------------------
  // Recursive menu renderer
  // ---------------------------------------------------------------------------

  const renderMenuItem = (
    item: DropdownMenuItem,
    index: number,
    level: number = 0
  ): React.ReactNode => {
    // Divider
    if (item.divider) {
      return (
        <div
          key={`divider-${level}-${index}`}
          className={`
            my-1
            border-t
            ${isDark ? 'border-gray-600' : 'border-gray-300'}
          `}
        />
      )
    }

    const hasSubmenu = !!item.items && item.items.length > 0

    /**
     * This is the important part.
     *
     * We only check the active index belonging
     * to THIS level.
     *
     * Example:
     *
     * activePath = [0, 1, 2]
     *
     * level 0 -> activePath[0] === index
     * level 1 -> activePath[1] === index
     * level 2 -> activePath[2] === index
     */
    const isSubmenuActive = activePath[level] === index

    return (
      <div key={`${level}-${index}`} className='relative'>
        <div
          className={getItemClasses(item)}
          onClick={() => {
            if (item.disabled) {
              return
            }

            if (hasSubmenu) {
              handleSubmenuClick(index, level)
            } else {
              handleItemClick(item)
            }
          }}
          onMouseEnter={event => {
            if (item.disabled) {
              return
            }

            event.currentTarget.style.backgroundColor = useBrandColor
              ? branding.hoverColor
              : branding.brandColor

            if (useBrandColor) {
              event.currentTarget.style.color = getContrastColor(
                branding.brandColor
              )
            }
          }}
          onMouseLeave={event => {
            if (item.disabled) {
              return
            }

            const popupStyles = getPopupStyles()

            event.currentTarget.style.backgroundColor =
              (popupStyles.backgroundColor as string) ||
              (isDark ? '#1f2937' : '#ffffff')

            event.currentTarget.style.color =
              (popupStyles.color as string) || (isDark ? '#ffffff' : '#000000')
          }}
        >
          <div className='flex items-center gap-2 rounded-md'>
            {item.icon && <span>{item.icon}</span>}

            <span>{item.text}</span>
          </div>

          {hasSubmenu &&
            (direction === 'RTL' ? (
              <IoChevronBackOutline />
            ) : (
              <IoChevronForward />
            ))}
        </div>

        {/* ---------------------------------------------------------------
            Nested submenu
           --------------------------------------------------------------- */}

        {hasSubmenu && isSubmenuActive && (
          <div
            className={`
                ${getPopupClasses()}
                ${direction === 'RTL' ? 'right-full mr-2' : 'left-full ml-2'}
                top-0
                mt-0
              `}
            style={getPopupStyles()}
          >
            {item.items!.map((subItem, subIndex) =>
              renderMenuItem(subItem, subIndex, level + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  // ---------------------------------------------------------------------------
  // Switcher props
  // ---------------------------------------------------------------------------

  const switcherProps: DropdownSwitcherProps = {
    onClick: toggleDropdown,
    ref: switcherRef as React.RefObject<HTMLElement>,
    'aria-expanded': isOpen,
    'aria-haspopup': true
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div
      ref={dropdownRef}
      className={`
        relative
        inline-block
        rounded-md
        ${className}
      `}
      dir={direction}
    >
      {/* Switcher */}
      {renderSwitcher(switcherProps)}

      {/* Root dropdown */}
      {isOpen && (
        <div className={getPopupClasses()} style={getPopupStyles()}>
          {items.map((item, index) => renderMenuItem(item, index, 0))}
        </div>
      )}
    </div>
  )
}
 