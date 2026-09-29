"use client";

import React, { useState, useRef, useEffect, KeyboardEvent } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

interface PinInputProps {
  length: number;
  value?: string;
  disabled?: boolean;
  placeholder?: string;
  mask?: boolean;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  onChange?: (value: string) => void;
  onBlur?: (value: string) => void;
  className?: string;
}

export const PinInput: React.FC<PinInputProps> = ({
  length,
  value,
  disabled = false,
  placeholder = "",
  mask = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  onChange,
  onBlur,
  className = "",
}) => {
  const { theme, direction, branding } = useGlobal();

  // Initialize state from value prop or empty array
  const getInitialValues = () => {
    if (value) {
      const chars = value.split('').slice(0, length);
      return [...chars, ...Array(length - chars.length).fill('')];
    }
    return Array(length).fill("");
  };

  const [values, setValues] = useState<string[]>(getInitialValues());
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Sync internal state with external value prop
  useEffect(() => {
    if (value !== undefined) {
      const chars = value.split('').slice(0, length);
      const newValues = [...chars, ...Array(length - chars.length).fill('')];
      setValues(newValues);
    }
  }, [value, length]);

  const handleChange = (index: number, value: string) => {
    // Only allow numeric input
    if (value && !/^\d$/.test(value)) {
      return;
    }

    if (value.length > 1) {
      value = value[value.length - 1];
    }

    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    onChange?.(newValues.join(""));

    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const isDark = theme === "dark" || theme === "dark-hc";

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16);
    const g = parseInt(hex?.slice(3, 5), 16);
    const b = parseInt(hex?.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const pinInputElement = (
    <div className={`flex gap-2 h-full ${direction === "RTL" ? "flex-row-reverse" : ""} ${className}`}>
      {Array.from({ length }).map((_, index) => (
        
        <input
          autoComplete="off"
          key={index}
          ref={(el:any) => (inputRefs.current[index] = el)}
          type={mask ? "password" : "text"}
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={values[index]||""}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            border-2
            text-center
            font-semibold
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            ${isDark ? "bg-gray-800 text-white border-gray-600" : "bg-white text-gray-900 border-gray-300"}
            transition-all duration-200
            focus:outline-none
          `}
          style={{
            width: `calc(${100 / length}% - ${(length - 1) * 0.5 / length}rem)`,
            height: "100%",
            borderRadius: "var(--border-radius)",
          }}
          onMouseEnter={(e) => {
            if (!disabled) {
              e.currentTarget.style.borderColor = branding.hoverColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && document.activeElement !== e.currentTarget) {
              e.currentTarget.style.borderColor = isDark ? "#4B5563" : "#D1D5DB";
            }
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = branding.selectionColor;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${hexToRgba(branding.selectionColor, 0.2)}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = isDark ? "#4B5563" : "#D1D5DB";
            e.currentTarget.style.boxShadow = "none";
            // Call onBlur callback with the complete PIN value
            onBlur?.(values.join(""));
          }}
        />
      ))}
    </div>
  );

  return (
       <CommonHeaderAndTooltip
         needTooltip={needTooltip}
         tooltipProps={tooltipProps}
         headerText={headerText}
         headerPosition={headerPosition}
         className={className}
  
       >
         {pinInputElement}
       </CommonHeaderAndTooltip>
     )
};
