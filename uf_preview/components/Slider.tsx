"use client";

import React, { useState, useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { getBorderRadiusClass } from "@/app/utils/branding";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

type ValidationState = "valid" | "invalid";
type TooltipDisplay = "on" | "off" | "auto";

interface SliderProps {
  disabled?: boolean;
  validationState?: ValidationState;
  tooltipDisplay?: TooltipDisplay;
  min?: number;
  max?: number;
  step?: number;
  marks?: boolean;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  showValue?: boolean;
  valueLabel?: string;
}

export const Slider: React.FC<SliderProps> = ({
  disabled = false,
  validationState = "valid",
  tooltipDisplay = "auto",
  min = 0,
  max = 100,
  step = 1,
  marks = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  value = 0,
  onChange,
  onBlur,
  className = "",
  showValue = false,
  valueLabel,
}) => {
  const { theme, branding, direction } = useGlobal();
  const [sliderValue, setSliderValue] = useState(value);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    setSliderValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value);
    setSliderValue(newValue);
    onChange?.(newValue);
  };

  const isDark = theme === "dark" || theme === "dark-hc";

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16);
    const g = parseInt(hex?.slice(3, 5), 16);
    const b = parseInt(hex?.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const getTrackColor = () => {
    if (validationState === "invalid") {
      return "#EF4444";
    }
    return branding.brandColor;
  };

  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const sliderElement = (
    <div
      className={`w-full h-full flex flex-col relative overflow-hidden ${direction === "RTL" ? "rtl" : ""}`}
      style={{ paddingTop: tooltipDisplay === "on" || (tooltipDisplay === "auto" && showTooltip) ? "40px" : "0px" }}
      onMouseEnter={() => {
        if (!disabled) {
          setIsHovered(true);
          if (tooltipDisplay === "auto") {
            setShowTooltip(true);
          }
        }
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        if (tooltipDisplay === "auto") {
          setShowTooltip(false);
        }
      }}
    >
      {/* Tooltip - positioned above, not clipped */}
      {(() => {
        // Explicit tooltip display logic
        if (tooltipDisplay === "off") return null;
        if (tooltipDisplay === "on") {
          return (
            <div
              className={`
                absolute
           
                ${getBorderRadiusClass(branding.borderRadius)}
                text-xs
                pointer-events-none
                whitespace-nowrap
                ${isDark ? "bg-gray-900 text-white" : "bg-gray-800 text-white"}
              `}
              style={{
                left: `${Math.min(Math.max(((sliderValue - min) / (max - min)) * 100, 5), 95)}%`,
                transform: "translate(-50%, -50%)",
                top: "12px",
                zIndex: 9999,
                borderRadius: "var(--border-radius)",
                fontFamily: "var(--font-body)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {sliderValue}
            </div>
          );
        }
        if (tooltipDisplay === "auto" && showTooltip) {
          return (
            <div
              className={`
                absolute
                px-2 py-1
                ${getBorderRadiusClass(branding.borderRadius)}
                text-xs
                pointer-events-none
                whitespace-nowrap
                ${isDark ? "bg-gray-900 text-white" : "bg-gray-800 text-white"}
              `}
              style={{
                left: `${Math.min(Math.max(((sliderValue - min) / (max - min)) * 100, 5), 95)}%`,
                transform: "translate(-50%, -50%)",
                top: "0",
                zIndex: 9999,
                borderRadius: "var(--border-radius)",
                fontFamily: "var(--font-body)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}
            >
              {sliderValue}
            </div>
          );
        }
        return null;
      })()}

      {/* Slider container - track is 1/2 of parent height, centered */}
      <div className={`flex flex-col w-full relative ${showValue && headerText ? "h-[50%]": showValue && marks ? "h-[25%]" :showValue || marks ? "h-[25%]" : "h-[100%]"}`}  >
        <div className="w-full relative pt-2" style={{ height: "100%" }}>
          {/* Background track */}
          <div
            className={`absolute w-full h-full ${
              isDark ? "bg-gray-700" : "bg-gray-200"
            } pointer-events-none transition-all duration-200 ${getBorderRadiusClass(branding.borderRadius)}`}
            style={{
              borderRadius: "var(--border-radius)",
              boxShadow: isHovered && !disabled
                ? `0 0 0 2px ${hexToRgba(branding.hoverColor, 0.2)}`
                : isFocused && !disabled
                ? `0 0 0 3px ${hexToRgba(branding.selectionColor, 0.3)}`
                : "none",
            }}
          />

          {/* Filled track */}
          <div
            className={`absolute h-full pointer-events-none transition-all duration-300 ease-out ${getBorderRadiusClass(branding.borderRadius)}`}
            style={{
              width: `${((sliderValue - min) / (max - min)) * 100}%`,
              backgroundColor: isHovered && !disabled ? branding.hoverColor : getTrackColor(),
              borderRadius: "var(--border-radius)",
              boxShadow: isFocused && !disabled
                ? `0 0 12px ${hexToRgba(branding.selectionColor, 0.6)}`
                : `0 0 8px ${hexToRgba(getTrackColor(), 0.4)}`,
            }}
          />

          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={sliderValue}
            onChange={handleChange}
            onFocus={() => !disabled && setIsFocused(true)}
            onBlur={(e) => {
              setIsFocused(false);
              onBlur?.(e);
            }}
            disabled={disabled}
            className={`
              w-full
              h-full
              appearance-none
              bg-transparent
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              ${getBorderRadiusClass(branding.borderRadius)}
              transition-all duration-200
              absolute
              focus:outline-none
            `}
            style={{
              accentColor: isFocused && !disabled ? branding.selectionColor : getTrackColor(),
              borderRadius: "var(--border-radius)",
            }}
          />
        </div>
      </div>

      {marks ? (() => {
        const totalSteps = Math.floor((max - min) / step);
        const maxMarks = 10; // Maximum number of marks to display

        // Calculate the interval between displayed marks
        const markInterval = totalSteps <= maxMarks ? 1 : Math.ceil(totalSteps / maxMarks);

        // Generate mark values
        const markValues = [];
        for (let i = 0; i <= totalSteps; i += markInterval) {
          const markValue = min + i * step;
          if (markValue <= max) {
            markValues.push(markValue);
          }
        }

        // Always include max if not already included
        if (markValues[markValues.length - 1] !== max) {
          markValues.push(max);
        }

        return (
          <div className="relative w-full h-8 mt-0 pointer-events-none overflow-hidden">
            {markValues.map((markValue, index) => {
              const isFirst = index === 0;
              const isLast = index === markValues.length - 1;
              const position = ((markValue - min) / (max - min)) * 100;

              return (
                <div
                  key={index}
                  className="absolute top-0 flex flex-col"
                  style={{
                    left: `${position}%`,
                    transform: isFirst ? "translateX(0)" : isLast ? "translateX(-100%)" : "translateX(-50%)",
                  }}
                >
                  <div
                    className={`w-0.5 h-2 mx-auto ${sliderValue >= markValue ? "bg-transparent" : isDark ? "bg-gray-600" : "bg-gray-400"}`}
                  />
                  <span
                    className={`mt-1 block  ${isDark ? "text-gray-400" : "text-gray-600"} ${
                      isFirst ? "text-left" : isLast ? "text-right" : "text-center"
                    }`}
                    style={{
                      maxWidth: isFirst || isLast ? "50px" : "40px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    {markValue}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })() : !showValue ? (
        <div className="flex justify-between mt-2 px-1">
          <span className={` ${isDark ? "text-gray-400" : "text-gray-600"}`} style={{ fontFamily: "var(--font-body)" }}>{min}</span>
          <span className={` ${isDark ? "text-gray-400" : "text-gray-600"}`} style={{ fontFamily: "var(--font-body)" }}>{max}</span>
        </div>
      ) : null}

      {showValue && (
        <p className={`font-bold text-center mt-2 ${isDark ? "text-gray-200" : "text-gray-900"}`} style={{ fontFamily: "var(--font-body)" }}>
          {valueLabel ? `${valueLabel} : ${sliderValue}` : sliderValue}
        </p>
      )}
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
      {sliderElement}
    </CommonHeaderAndTooltip>
  )
};
