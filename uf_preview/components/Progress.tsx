"use client";

import React, { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { ProgressTheme, HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

interface ProgressProps {
  theme: ProgressTheme;
  isDynamic?: boolean;
  text?: string;
  value: number;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({
  theme: progressTheme,
  isDynamic = false,
  text,
  value,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
}) => {
  const { theme, direction, branding } = useGlobal();

  const getProgressColor = (): string => {
    switch (progressTheme) {
      case "default":
        return branding.brandColor;
      case "info":
        return "#3B82F6";
      case "success":
        return "#10B981";
      case "warning":
        return "#F59E0B";
      case "danger":
        return "#EF4444";
      case "misc":
        return "#8B5CF6";
      default:
        return branding.brandColor;
    }
  };

  // Helper to convert hex to rgba for hover effect
  const hexToRgba = (hex: string, alpha: number): string => {
    if (!/^#([0-9a-fA-F]{6})$/.test(hex)) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const isDark = theme === "dark" || theme === "dark-hc";
  const clampedValue = Math.min(100, Math.max(0, value));
  const progressColor = getProgressColor();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  const progressElement = (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <div className="flex justify-between items-center mb-1">
        {text && (
          <span className={`${isDark ? "text-gray-200" : "text-gray-900"}`}>
            {text}
          </span>
        )}
        {isDynamic && (
          <span className={`font-semibold ${isDark ? "text-gray-200" : "text-gray-900"}`}>
            {clampedValue}%
          </span>
        )}
      </div>
      <div
        className="w-full flex-1 relative"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onMouseMove={handleMouseMove}
      >
        {hovered && (
          <div
            className="fixed px-2 py-0.5 rounded text-white text-xs font-semibold pointer-events-none whitespace-nowrap z-50 -translate-x-1/2"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y - 30,
              backgroundColor: progressColor,
            }}
          >
            {clampedValue}%
          </div>
        )}
        <div
          className={`w-full h-full ${isDark ? "bg-gray-700" : "bg-gray-200"} rounded-full overflow-hidden transition-all duration-200`}
          style={{ borderRadius: "var(--border-radius)" }}
        >
          <div
            className="h-full transition-all duration-300 ease-out"
            style={{
              width: `${clampedValue}%`,
              backgroundColor: progressColor,
              borderRadius: "var(--border-radius)",
              boxShadow: `0 0 8px ${hexToRgba(progressColor, 0.4)}`,
            }}
          />
        </div>
      </div>
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
      {progressElement}
    </CommonHeaderAndTooltip>
  )
};
