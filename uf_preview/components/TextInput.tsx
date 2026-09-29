'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useGlobal } from '@/context/GlobalContext'
import { useEventBus } from '@/context/EventBusContext'
import { useInfoMsg } from "@/app/components/infoMsgHandler";
import { Tooltip } from './Tooltip'
import { Icon } from './Icon'
import {
  ComponentSize,
  TextInputType,
  TextInputView,
  TextAreaPin,
  HeaderPosition,
  TooltipProps as TooltipPropsType,
  ComponentEvents
} from '@/types/global'
import { getBorderRadiusClass } from '@/app/utils/branding'
import { RiCloseCircleLine } from 'react-icons/ri'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'
type ContentAlign = 'center' | 'left' | 'right'
interface TextInputProps {
  nodeId?: string
  disabled?: boolean
  label?: string
  pin?: TextAreaPin
  placeholder?: string
  type?: TextInputType
  leftContent?: React.ReactNode | string
  rightContent?: React.ReactNode | string
  topContent?: boolean
  readOnly?: boolean
  view?: TextInputView
  name?: string
  value?: string
  note?: string
  validationState?: 'valid' | 'invalid'
  errorMessage?: string
  hasClear?: boolean
  autoFocus?: boolean
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  require?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined
  onBlur?: React.FocusEventHandler<HTMLInputElement> | undefined
  events?: ComponentEvents[]
  className?: string
  fillContainer?: boolean
  contentAlign?: ContentAlign
  itsHaveCurrency?: boolean
}

export const TextInput: React.FC<TextInputProps> = ({
  nodeId,
  disabled = false,
  label,
  pin = 'round-round',
  placeholder="",
  type = 'text',
  leftContent,
  rightContent,
  topContent = false,
  readOnly = false,
  view = 'normal',
  name = '',
  value = '',
  note,
  validationState,
  errorMessage,
  hasClear = false,
  autoFocus = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = 'top',
  require = false,
  onChange,
  onBlur = () => {},
  events,
  className = '',
  fillContainer = true,
  contentAlign = 'left',
  itsHaveCurrency=false
}) => {
  const [onloadType,setOnloadType]=useState("text")
  const { theme, direction, branding,displayFormat } = useGlobal()
  const eventBus = useEventBus()
  const [internalValue, setInternalValue] = useState(value)
  const [isDisabled, setIsDisabled] = useState(disabled)
  const [isVisible, setIsVisible] = useState(true)
  const [leftWidth, setLeftWidth] = useState(0)
  const [rightWidth, setRightWidth] = useState(0)
  const leftContentRef = useRef<HTMLDivElement>(null)
  const rightContentRef = useRef<HTMLDivElement>(null)
  const [alteredType,setAlteredType]=useState("text")
  const prevRefreshRef = useRef(false);
  const rawValueRef = useRef(value);
    const showToast = useInfoMsg()                                                                                                                                                    
       const prevValidationState = useRef(validationState)                                                                                                                               
                                                                                                                                                                                       
      useEffect(() => {                                                                                                                                                                 
       if (validationState === 'invalid' && errorMessage ) {                                                                               
         showToast(errorMessage, 'danger')                                                                                                                                             
         }                                                                                                                                                                                                                                                                                                              
       }, [validationState, errorMessage])   

  // Measure left and right content widths
  useEffect(() => {
    if (leftContentRef.current) {
      setLeftWidth(leftContentRef.current.offsetWidth)
    }
    if (rightContentRef.current) {
      setRightWidth(rightContentRef.current.offsetWidth)
    }
  }, [leftContent, rightContent, hasClear, internalValue])

  // Sync internal value with prop value
  useEffect(() => {
    setInternalValue(value)
  }, [value])
  const toast : Function = useInfoMsg()
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    prevRefreshRef.current= true
    const newValue = e.target.value
    if(type=="number")
    {

      // setOnloadType("number")
      if (e.target.validity.badInput) {
        toast("please enter numbers only","danger")
        return
      }
      if (!isNaN(+newValue)) {
          onChange?.(e)
      }else{
        toast("please enter numbers only","danger")
        return
      }
    }else
    {
      onChange?.(e)
    }
    setInternalValue(newValue)
    rawValueRef.current = newValue
    // Emit rise events when onChange occurs
    const onChangeEvent = events?.find(e => e.name === 'onChange')
    if (onChangeEvent?.enabled && onChangeEvent.rise && nodeId) {
      onChangeEvent.rise.forEach(riseEvent => {
        eventBus.emit(riseEvent.key, {
          nodeId,
          data: { value: newValue }
        })
      })
    }
  }

  const handleClear = () => {
    setInternalValue('')
    if (onChange) {
      const syntheticEvent = {
        target: { value: '', name },
        currentTarget: { value: '', name }
      } as React.ChangeEvent<HTMLInputElement>
      onChange(syntheticEvent)
    }
  }

  // Subscribe to riseListen events
  useEffect(() => {
    if (!nodeId || !events) return

    const unsubscribers: (() => void)[] = []

    events.forEach(event => {
      if (event.enabled && event.riseListen) {
        event.riseListen.forEach(listener => {
          const subscribe =
            listener.listenerType === 'type1'
              ? eventBus.subscribeGlobal
              : (key: string, cb: any) => eventBus.subscribe(key, nodeId, cb)

          const unsubscribe = subscribe(listener.key, payload => {
            // Handle different event types
            switch (listener.key) {
              case 'hideElement':
                setIsVisible(false)
                break
              case 'showElement':
                setIsVisible(true)
                break
              case 'disableElement':
                setIsDisabled(true)
                break
              case 'enableElement':
                setIsDisabled(false)
                break
              case 'clearHandler':
                setInternalValue('')
                // onChange?.("");
                break
              case 'refreshElement':
                // Refresh could reload value from memory or reset to initial
                if (payload.data?.value !== undefined) {
                  setInternalValue(payload.data.value)
                }
                break
              default:
                // For custom events, just log them
                console.log(
                  `TextInput ${nodeId} received event: ${listener.key}`,
                  payload
                )
            }
          })

          unsubscribers.push(unsubscribe)
        })
      }
    })

    return () => {
      unsubscribers.forEach(unsub => unsub())
    }
  }, [nodeId, events, eventBus])

  const getPinClasses = () => {
    const baseRadius = getBorderRadiusClass(branding.borderRadius)

    if (pin === 'clear-clear') {
      return 'rounded-lg'
    }

    const [left, right] = pin.split('-')
    const leftRadius =    
      left === 'round'
        ? 'rounded-l-3xl'
        : left === 'brick'
        ? 'rounded-l-none'
        :left === 'clear'
        ? 'rounded-l-lg'
        : `rounded-l${baseRadius.replace('rounded', '')}`
    const rightRadius =
      right === 'round'
        ? 'rounded-r-3xl'
        : right === 'brick'
        ? 'rounded-r-none'
        :right === 'clear'
        ? 'rounded-r-lg'
        : `rounded-r${baseRadius.replace('rounded', '')}`

    return `${leftRadius} ${rightRadius}`
  }

  const getInputStyles = (): React.CSSProperties => {
    const isDark = theme === 'dark' || theme === 'dark-hc'
    const styles: React.CSSProperties = {}

    if (validationState === 'invalid' || errorMessage) {
      styles.borderColor = '#EF4444'
    } else if (validationState === 'valid') {
      styles.borderColor = '#10B981'
    } else if (view === 'normal') {
      styles.borderColor = isDark ? '#4B5563' : '#D1D5DB'
    } else if (view === 'clear') {
      styles.borderColor = 'transparent'
    }

    return styles
  }
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
  const isDark = theme === 'dark' || theme === 'dark-hc'

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16);
    const g = parseInt(hex?.slice(3, 5), 16);
    const b = parseInt(hex?.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };
  const customeOnBlur=(e:any)=>{
    onBlur(e)
    if(type=='number' && itsHaveCurrency)
    {
      setOnloadType("text")
      const decimalPlaces = displayFormat?.textInputProperty?.decimal_places ?? 2
      let formatted = Number(e.target.value).toLocaleString(undefined, {
        minimumFractionDigits: decimalPlaces,
        maximumFractionDigits: decimalPlaces
      });
      if(itsHaveCurrency)
      {
        // if currency simbol is needed just uncommant this code
        // formatted=(displayFormat?.textInputProperty?.currencyDisplayFormat||"₹")+formatted
      }
      setInternalValue(formatted)
    }
  }
  const customeOnFocus=(_e:any)=>{
    if(type=='number' && itsHaveCurrency)
    {
      setOnloadType("text")
      setInternalValue(rawValueRef.current)
    }
  }
  useEffect(()=>{
    if (prevRefreshRef.current==false) {
      if(type=='number' && itsHaveCurrency)
      {
        setOnloadType("text")
        rawValueRef.current = value
        const decimalPlaces = displayFormat?.textInputProperty?.decimal_places ?? 2
        let formatted = Number(value).toLocaleString(undefined, {
          minimumFractionDigits: decimalPlaces,
          maximumFractionDigits: decimalPlaces
        });
        if(itsHaveCurrency)
        {
          // if currency simbol is needed just uncommant this code
          //formatted=(displayFormat?.textInputProperty?.currencyDisplayFormat||"₹")+formatted
        }
        setInternalValue(formatted)
      }
    }
  },[value,type,itsHaveCurrency,displayFormat])

  const inputElement = (
    <div
      className={`${getFillClasses()}  relative`}
    >
      {label && topContent && (
        <label
          className={`mb-2 block  font-medium ${
            isDark ? 'text-gray-200' : 'text-gray-900'
          }`}
          style={{ fontFamily: 'var(--font-body)' }}
        >
          {label}
        </label>
      )}

      <div
        className={`relative flex items-center ${
          fillContainer ? 'h-full' : ''
        }`}
      >
        {leftContent && (
          <div
            ref={leftContentRef}
            className={`absolute ${
              direction === 'RTL' ? 'right-3' : 'left-3'
            } ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center`}
          >
            {leftContent}
          </div>
        )}

        <input
          type={onloadType}
          name={name}
          value={internalValue}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoFocus={autoFocus}
          // style={getInputStyles()}
          className={`
            ${getFillClasses()}
            ${getPinClasses()}
            ${getTextAlignClasses()}
            
            ${
              view === 'normal'
                ? 'border-2'
                : view === 'clear'
                ? 'border-2 border-transparent'
                : 'border-0 border-b-2'
            }
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
            ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
            p-2 transition-all duration-200
            focus:outline-none
            ${className}
          `}
          style={{
            fontFamily: 'var(--font-body)',
            ...getInputStyles(),
            ...(leftContent
              ? direction === 'RTL'
                ? { paddingRight: leftWidth + 20 }
                : { paddingLeft: leftWidth + 20 }
              : {}),
            ...(rightContent || (hasClear && internalValue)
              ? direction === 'RTL'
                ? { paddingLeft: rightWidth + 20 }
                : { paddingRight: rightWidth + 20 }
              : {})
          }}
          onMouseEnter={e => {
            if (!disabled && !errorMessage && !validationState && document.activeElement !== e.currentTarget) {
              e.currentTarget.style.borderColor = branding.hoverColor
            }
          }}
          onMouseLeave={e => {
            if (!disabled && !errorMessage && !validationState && document.activeElement !== e.currentTarget) {
              if (view === 'clear') {
                e.currentTarget.style.borderColor = 'transparent'
              } else {
                e.currentTarget.style.borderColor = isDark ? '#4B5563' : '#D1D5DB'
              }
            }
          }}
          onFocus={e => {
            if (!errorMessage && !validationState) {
              e.currentTarget.style.borderColor = branding.selectionColor
              if (view !== 'clear') {
                e.currentTarget.style.boxShadow = `0 0 0 3px ${hexToRgba(branding.selectionColor, 0.2)}`
              }
            }
            customeOnFocus(e)
          }}
          onBlur={e => {
            if (!errorMessage && !validationState) {
              if (view === 'clear') {
                e.currentTarget.style.borderColor = 'transparent'
                e.currentTarget.style.boxShadow = 'none'
              } else {
                e.currentTarget.style.borderColor = isDark
                  ? '#4B5563'
                  : '#D1D5DB'
                e.currentTarget.style.boxShadow = 'none'
              }
            }
            customeOnBlur(e)
          }}
        />

        {(rightContent || (hasClear && internalValue)) && (
          <div
            ref={rightContentRef}
            className={`absolute ${
              direction === 'RTL' ? 'left-3' : 'right-3'
            } flex items-center gap-2`}
          >
            {hasClear && internalValue && (
              <button
                onClick={handleClear}
                type='button'
                className={`${
                  isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
                } transition-all duration-200`}
                onMouseEnter={e => {
                  e.currentTarget.style.color = branding.hoverColor
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = isDark ? '#9CA3AF' : '#6B7280'
                }}
              >
                <RiCloseCircleLine size={16} />
              </button>
            )}
            {rightContent && (
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                {rightContent}
              </span>
            )}
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
        fillContainer={fillContainer}
        required={require}
      >
        {inputElement}
      </CommonHeaderAndTooltip>
    )
};