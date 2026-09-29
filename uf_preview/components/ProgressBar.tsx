"use client";

import React, { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import {
  ProgressTheme,
  HeaderPosition,
  TooltipProps as TooltipPropsType,
} from "@/types/global";
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

  progressType?: "linear" | "circular";
}

export const ProgressBar: React.FC<ProgressProps> = ({
  theme: progressTheme,
  isDynamic = false,
  text,
  value,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
  progressType = "linear",
}) => {
  const { theme, branding } = useGlobal();

  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const isDark = theme === "dark" || theme === "dark-hc";
  const clampedValue = Math.min(100, Math.max(0, value));

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

  const progressColor = getProgressColor();

  const hexToRgba = (hex: string, alpha: number): string => {
    if (!/^#([0-9a-fA-F]{6})$/.test(hex)) {
      return `rgba(0, 0, 0, ${alpha})`;
    }

    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  // =========================
  // Circular Progress Config
  // =========================
  const radius = 45;
  const strokeWidth = 8;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  const strokeDashoffset =
    circumference - (clampedValue / 100) * circumference;

  const progressElement = (
    <div className={`w-full h-full flex flex-col ${className}`}>
      {text && (
        <div className="mb-2">
          <span
            className={`${
              isDark ? "text-gray-200" : "text-gray-900"
            }`}
          >
            {text}
          </span>
        </div>
      )}

      {/* ========================= */}
      {/* LINEAR PROGRESS */}
      {/* ========================= */}
      {progressType === "linear" && (
        <>
          <div className="flex justify-between items-center mb-1">
            {isDynamic && (
              <span
                className={`font-semibold ${
                  isDark ? "text-gray-200" : "text-gray-900"
                }`}
              >
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
              className={`w-full h-4 ${
                isDark ? "bg-gray-700" : "bg-gray-200"
              } rounded-full overflow-hidden`}
            >
              <div
                className="h-full transition-all duration-300 ease-out"
                style={{
                  width: `${clampedValue}%`,
                  backgroundColor: progressColor,
                  boxShadow: `0 0 8px ${hexToRgba(progressColor, 0.4)}`,
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* ========================= */}
{/* CIRCULAR PROGRESS */}
{/* ========================= */}
{progressType === "circular" && (
  <div
    className="relative flex items-center justify-center w-full h-full"
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

    <svg
      viewBox="0 0 100 100"
      className="w-full h-full"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* Background Circle */}
      <circle
        stroke={isDark ? "#374151" : "#E5E7EB"}
        fill="transparent"
        strokeWidth="8"
        r="40"
        cx="50"
        cy="50"
      />

      {/* Progress Circle */}
      <circle
        stroke={progressColor}
        fill="transparent"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${2 * Math.PI * 40}`}
        strokeDashoffset={`${
          2 * Math.PI * 40 -
          (clampedValue / 100) * (2 * Math.PI * 40)
        }`}
        r="40"
        cx="50"
        cy="50"
        style={{
          transition: "stroke-dashoffset 0.35s",
          transform: "rotate(-90deg)",
          transformOrigin: "50% 50%",
          filter: `drop-shadow(0 0 6px ${hexToRgba(
            progressColor,
            0.5
          )})`,
        }}
      />
    </svg>

    {/* Center Value */}
    <div className="absolute flex flex-col items-center justify-center">
      <span
        className={`font-bold text-[clamp(12px,2vw,28px)] ${
          isDark ? "text-white" : "text-gray-900"
        }`}
      >
        {clampedValue}%
      </span>

      {isDynamic && (
        <span
          className={`text-[clamp(8px,1vw,14px)] ${
            isDark ? "text-gray-300" : "text-gray-500"
          }`}
        >
          Progress
        </span>
      )}
    </div>
  </div>
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
      {progressElement}
    </CommonHeaderAndTooltip>
  );
};