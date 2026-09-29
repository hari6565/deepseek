
import React, { useEffect,useState } from 'react';
import { FiVolume2 } from 'react-icons/fi';
import { HeaderPosition, TooltipProps as TooltipPropsType } from '@/types/global';
import { useGlobal } from '@/context/GlobalContext';
import { CommonHeaderAndTooltip } from './CommonHeaderAndTooltip';
import {  Branding } from "@/types/global";
interface TextAreaWithEndContentProps {
  value?: string;
  rows?: number;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  style?: React.CSSProperties;
  endContent?: React.ReactNode;
  disabled?: boolean;
  placeholder?: string;
  [key: string]: any;
}

function TextAreaWithEndContent({ endContent, placeholder, branding, isDark, ...props }: TextAreaWithEndContentProps & { branding: Branding; isDark: boolean }) {
  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16);
    const g = parseInt(hex?.slice(3, 5), 16);
    const b = parseInt(hex?.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Extract non-DOM props to avoid React warnings
  const {
    className,
    needTooltip,
    tooltipProps,
    headerText,
    headerPosition,
    tooltipDisplay,
    onUpdate,
    label,
    ...domProps
  } = props;

  return (
    <div className={`relative w-full h-full ${className || ''} overflow-hidden`}>
      <textarea
        {...domProps}

        placeholder={placeholder}
        className={`
          w-full
          h-full
          p-2
          border-2
          ${isDark ? 'border-gray-600 bg-gray-800 text-white' : 'border-gray-300 bg-white text-gray-900'}
          resize-vertical
          focus:outline-none
          transition-all duration-200
          font-inherit
        `}
        style={{
          ...domProps.style,
          borderRadius: 'var(--border-radius)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = branding.selectionColor;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${hexToRgba(branding.selectionColor, 0.2)}`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = isDark ? '#4B5563' : '#D1D5DB';
          e.currentTarget.style.boxShadow = 'none';
          domProps.onBlur?.(e);
        }}
        onMouseEnter={(e) => {
          if (!domProps.disabled && document.activeElement !== e.currentTarget) {
            e.currentTarget.style.borderColor = branding.hoverColor;
          }
        }}
        onMouseLeave={(e) => {
          if (!domProps.disabled && document.activeElement !== e.currentTarget) {
            e.currentTarget.style.borderColor = isDark ? '#4B5563' : '#D1D5DB';
          }
        }}
      />
      {endContent}
    </div>
  );
}

interface TextToSpeechProps {
  value?: string | number;
  label?: string;
  disabled?: boolean;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onUpdate?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  style?: React.CSSProperties;
  placeholder?: string;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  [key: string]: any;
}

export function TextToSpeech(props: TextToSpeechProps){
  const { branding, theme } = useGlobal();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [text, setText] = useState(props.value?.toString() || '');
  const isDark = theme === "dark" || theme === "dark-hc";

  const handleSpeak = () => {
    if (!text.trim()) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utter);
  };

    useEffect(() => {
    setText(props.value?.toString() || '');
  }, [props.value]);

  const endContent = (
    <button
      onClick={handleSpeak}
      disabled={isSpeaking || props.disabled}
      className={`
        absolute
        right-3
        sm:right-4
        top-2
        sm:top-3
        border-none
        rounded-full
        flex
        items-center
        justify-center
        cursor-pointer
        text-white
        text-base sm:text-lg md:text-xl
        shadow-md
        p-0
        min-w-0
        transition-all duration-200
        ${isSpeaking ? 'opacity-70 animate-pulse' : ''}
        ${props.disabled || isSpeaking ? 'cursor-not-allowed' : 'hover:shadow-lg'}
      `}
      style={{
        backgroundColor: branding.brandColor,
        width: '10%',
        height: '10%',
      }}
      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isSpeaking && !props.disabled) {
          e.currentTarget.style.backgroundColor = branding.hoverColor;
        }
      }}
      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
        if (!isSpeaking && !props.disabled) {
          e.currentTarget.style.backgroundColor = branding.brandColor;
        }
      }}
    >
      <FiVolume2 style={{ width: '60%', height: '60%' }} />
    </button>
  );
  const textAreaContent = (
    <div className="w-full h-full flex flex-col">
      {props.label && (
        <label className={`block mb-2  font-medium text-gray-700 dark:text-gray-300`}>
          {props.label}
        </label>
      )}
      <div className="flex-1">
        <TextAreaWithEndContent
          {...props}
          value={text}
          // rows={props?.rows||4}
          disabled={props.disabled}
          placeholder={props.placeholder}
          onChange={(e) => {
            setText(e.target.value);
            props.onUpdate?.(e);
          }}
          onBlur={props.onBlur}
          endContent={endContent}
          branding={branding}
          isDark={isDark}
        />
      </div>
      {isSpeaking && (
        <p className="mt-2 text-xs sm:text-sm flex items-center gap-2" style={{ color: branding.brandColor }}>
          <span className="inline-block w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: branding.brandColor }}></span>
          Speaking...
        </p>
      )}
    </div>
  );
  return (
    <CommonHeaderAndTooltip
      needTooltip={props?.needTooltip}
      tooltipProps={props?.tooltipProps}
      headerText={props?.headerText}
      headerPosition={props?.headerPosition}
      className={props?.className}
      fillContainer={props?.fillContainer}

    >
      {textAreaContent}
    </CommonHeaderAndTooltip>
       )
}
