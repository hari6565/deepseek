import React, { useEffect, useState } from 'react'
import { TextInput } from './TextInput'
import { Button } from './Button'
import { FiMic, FiMicOff } from 'react-icons/fi'
import { Icon } from '@/components/Icon'
import SpeechRecognition, {
  useSpeechRecognition
} from 'react-speech-recognition'
import { Tooltip } from './Tooltip'
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType
} from '@/types/global'
import { useGlobal } from '@/context/GlobalContext'
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip'

type ContentAlign = 'left' | 'center' | 'right'
interface SpeechToTextInputProps extends Omit<any, 'onChange'> {
  onChange: (value: string) => void
  value: string
  onSearch: () => {}
  className?: string
  disabled?: boolean
  needTooltip?: boolean
  tooltipProps?: TooltipPropsType
  headerText?: string
  headerPosition?: HeaderPosition
  placeholder?: string
  label?: string
  contentAlign?: ContentAlign
}

export function SpeechToTextInput(props: SpeechToTextInputProps) {
  const {
    needTooltip = false,
    tooltipProps,
    headerText,
    headerPosition = 'top',
    placeholder = 'Start speaking or typing...',
    label,
    className = '',
    ...restProps
  } = props
  const { theme, direction } = useGlobal()
  const { transcript, resetTranscript, browserSupportsSpeechRecognition } =
    useSpeechRecognition()
  const [openMic, setOpenMic] = useState<any>(true)
  const [inputValue, setInputValue] = useState(restProps.value || '')

  useEffect(() => {
    setInputValue(transcript)
    restProps.onChange(transcript)
  }, [transcript])

  useEffect(() => {
    setInputValue(restProps.value || '')
  }, [restProps.value])

  const handleSearch = () => {
    restProps.onSearch()
  }
  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
    restProps.onChange(e.target.value)
  }

  if (!browserSupportsSpeechRecognition) {
    return <p>Speech Recognition not supported in this browser.</p>
  }

  const toggleMic = () => {
    if (restProps.disabled) return
    if(openMic){
      resetTranscript()
      SpeechRecognition.startListening({ continuous: true, language: 'en-US' })
      setInputValue('')
      setOpenMic(false)
    }else{
      SpeechRecognition.stopListening()
      setOpenMic(true)
    }
  }

  const isDark = theme === 'dark' || theme === 'dark-hc'

  const inputElement = (
    <div className='relative h-full w-full overflow-hidden'>
      {label && (
        <label
          className={`mb-2 block font-medium ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
      )}
      <TextInput
        {...restProps}
        value={inputValue}
        onChange={handleTyping}
        disabled={restProps.disabled}
        placeholder={placeholder}
        contentAlign={restProps.contentAlign}
        className={`w-full rounded-full border border-gray-200 bg-white  text-gray-600 shadow-md outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-400/20 focus:ring-opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400/20 dark:focus:ring-opacity-50 ${className}`}
        view='clear'
        rightContent={
          <div className='justify-end top-1/2 items-center gap-2'>
            <button
              onClick={toggleMic}
              disabled={restProps.disabled}
              className='rounded-full p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
              style={{
                fontSize: '18px',
                color: openMic ? 'bg-red-300' : 'bg-greeen-400'
              }}
            >
              {openMic ? <FiMicOff /> : <FiMic />}
            </button>
            <button
              onClick={() => {
                if (restProps.disabled) return
                setOpenMic(true),
                  handleSearch(),
                  SpeechRecognition.stopListening()
              }}
              disabled={restProps.disabled}
              className='rounded-full p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50'
              style={{
                fontSize: '18px',
                color: '#5f6368'
              }}
            >
              <Icon data='FaSearch' size={18} />
            </button>
          </div>
        }
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
    >
      {inputElement}
    </CommonHeaderAndTooltip>
  )
}