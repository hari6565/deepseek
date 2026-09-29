"use client";

import React from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import {
  HeaderPosition,
  TooltipProps as TooltipPropsType,
} from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

type ContentAlign = "left" | "center" | "right";

interface CheckboxProps {
  checked?: boolean;
  disabled?: boolean;
  content?: string;
  title?: string;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  onChange?: (checked: boolean) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  value?: boolean;
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  disabled = false,
  content,
  title,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  onChange,
  onBlur,
  className = "",
  value,
  fillContainer = true,
  contentAlign = "center"
}) => {
  const { theme, direction } = useGlobal();

  const getCheckboxStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};
    const isDark = theme === "dark" || theme === "dark-hc";

    if (disabled) {
      styles.backgroundColor = isDark ? "#374151" : "#E5E7EB";
      styles.borderColor = isDark ? "#4B5563" : "#D1D5DB";
      // Only show checkmark if it's actually checked
      styles.color = checked ? (isDark ? "#6B7280" : "#9CA3AF") : "transparent";
    } else if (checked) {
      styles.backgroundColor = "var(--selection-color)";
      styles.borderColor = "var(--selection-color)";
      styles.color = "white";
    } else {
      styles.backgroundColor = isDark ? "#1F2937" : "white";
      styles.borderColor = isDark ? "#4B5563" : "#D1D5DB";
      styles.color = "transparent";
    }

    return styles;
  };

  const getLabelThemeClasses = () => {
    const isDark = theme === "dark" || theme === "dark-hc";
    return isDark ? "text-gray-200" : "text-gray-900";
  };

  const getFillClasses = () => {
    if (!fillContainer) return "";
    return "w-full";
  };

  const getContentAlignClasses = () => {
    switch (contentAlign) {
      case "left":
        return "justify-start";
      case "right":
        return "justify-end";
      case "center":
      default:
        return "justify-center";
    }
  };

  
  const checkboxElement = (
    <label
      className={`
      flex items-center
      ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      ${getContentAlignClasses()}
      ${getFillClasses()}
      ${fillContainer ? "h-full max-h-full overflow-hidden" : ""}
      ${className}
      `}
    >
      <div
        className={`relative flex-shrink-0 ${fillContainer ? "h-full max-h-full" : ""}`}
        style={fillContainer ? { aspectRatio: "1/1", maxHeight: "100%" } : {}}
      >
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange?.(e.target.checked)}
          onBlur={onBlur}
          className="sr-only"
        />
        <div
          style={{
            ...getCheckboxStyles(),
            borderRadius: "var(--border-radius)",
            ...(fillContainer ? { width: "100%", height: "100%" } : {}),
          }}
          className={`
            border-2 transition-all flex items-center justify-center
          `}
          onMouseEnter={(e) => {
            if (!disabled && !checked) {
              e.currentTarget.style.borderColor = "var(--hover-color)";
            }
          }}
          onMouseLeave={(e) => {
            if (!disabled && !checked) {
              const isDark = theme === "dark" || theme === "dark-hc";
              e.currentTarget.style.borderColor = isDark ? "#4B5563" : "#D1D5DB";
            }
          }}
        >
        <svg
          className="w-full h-full p-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3}
            d="M5 13l4 4L19 7"
          />
        </svg>
        </div>
      </div>
      {content && (
        <span
          className={`${direction === "RTL" ? "mr-2" : "ml-2"} ${getLabelThemeClasses()} overflow-hidden text-ellipsis whitespace-nowrap flex-shrink`}
        >
          {content}
        </span>
      )}
    </label>
  );
  return (
    <CommonHeaderAndTooltip
      needTooltip={needTooltip}
      tooltipProps={tooltipProps}
      headerText={headerText}
      headerPosition={headerPosition}
      className={className}
      fillContainer={fillContainer}
    >
      {checkboxElement}
    </CommonHeaderAndTooltip>
  )
};
