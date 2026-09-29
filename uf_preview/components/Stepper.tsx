"use client";

import React, { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { GravityIcon } from "@/types/icons";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";
import { Icon } from "./Icon";

type HeaderAlignment = "left" | "center" | "right" | "full";

interface StepItem {
  id: string;
  title: string;
  icon?: GravityIcon;
  content?: React.ReactNode;
}

interface StepperProps {
  items: StepItem[];
  security: any[];
  disabled?: boolean;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  headerAlignment?: HeaderAlignment;
  defaultActiveId?: string;
  activeTab?: string;
  onChange?: (id: any) => void;
  className?: string;
  tabHeaders?: StepItem[];
  tabHistory?: Record<string, boolean>;
}

export const Stepper: React.FC<StepperProps> = ({
  items,
  security,
  disabled = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  headerAlignment = "full",
  defaultActiveId,
  activeTab: activeTabProp,
  onChange = () => {},
  className = "",
  tabHeaders = [],
  tabHistory = {},
}) => {
  const { theme, branding } = useGlobal();
  const [activeTab, setActiveTab] = useState(defaultActiveId || items[0]?.id || "");

  const currentActiveTab = activeTabProp ?? activeTab;

  const handleStepClick = (id: string) => {
    onChange(id);
    setActiveTab(id);
  };

  const isDark = theme === "dark" || theme === "dark-hc";

  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16);
    const g = parseInt(hex?.slice(3, 5), 16);
    const b = parseInt(hex?.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const visibleItems = items.filter((item) => security?.includes(item.id));
  const activeContent = items.find((item) => item.id === currentActiveTab)?.content;

  const getJustifyClass = () => {
    switch (headerAlignment) {
      case "left":   return "justify-start";
      case "center": return "justify-center";
      case "right":  return "justify-end";
      case "full":
      default:       return "";
    }
  };

  const Chevron = () => (
    <span
      className={`flex-shrink-0 mx-2 ${isDark ? "text-gray-600" : "text-gray-300"}`}
      aria-hidden
    >
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none">
        <path
          d="M1 1l5 5-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
   const stepperElement = (
    <div className="w-full h-full flex flex-col">
      {/* Step header bar */}
      <div
        className={`
          flex-shrink-0 flex flex-row items-center w-full
          ${getJustifyClass()}
          px-3 py-2
          rounded-xl
        `}
      >
        {visibleItems.map((item, index) => {
          const isActive = currentActiveTab === item.id;
          const stepNumber = index + 1;

          return (
            <React.Fragment key={item.id}>
              {/* Step button */}
              <button
                onClick={() => handleStepClick(item.id)}
                disabled={tabHistory[item.id]}
                style={{
                  backgroundColor: isActive ? (isDark ? "#111827" : "#F3F4F6") : "transparent",
                }}
                className={`
                  flex items-center gap-2
                  rounded-lg
                  transition-all duration-150
                  ${headerAlignment === "full" ? "flex-1" : ""}
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  px-3 py-2
                `}

                onMouseEnter={(e) => {
                  if (!disabled && !isActive) {
                    e.currentTarget.style.backgroundColor = hexToRgba(branding.hoverColor, 0.08);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                onFocus={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.outline = `2px solid ${hexToRgba(branding.selectionColor, 0.4)}`;
                    e.currentTarget.style.outlineOffset = "2px";
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.outline = "";
                }}
              >
                {/* Step circle */}
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                  style={{
                    backgroundColor: isActive
                      ? branding.brandColor
                      : isDark ? "#374151" : "#D1D5DB",
                    color: isActive
                      ? "#ffffff"
                      : isDark ? "#6B7280" : "#9CA3AF",
                  }}
                >
                  {item.icon ? <Icon data={item.icon} size={13} /> : stepNumber}
                </span>

                {/* Step label */}
                <span
                  className={`
                    whitespace-nowrap transition-all
                    ${isActive
                      ? `font-semibold ${isDark ? "text-white" : "text-gray-900"}`
                      : `font-normal ${isDark ? "text-gray-500" : "text-gray-400"}`
                    }
                  `}
                >
                  {item.title}
                </span>
              </button>

              {/* Chevron separator â€” shown after every step including last */}
              <Chevron />
            </React.Fragment>
          );
        })}

        {/* Optional tab headers grid */}
        {tabHeaders && tabHeaders.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(24, 1fr)",
              gridTemplateRows: "repeat(auto-fill, 4px)",
              columnGap: "8px",
              flex: 1,
              placeItems: "stretch",
              gridAutoRows: "4px",
              overflow: "hidden",
            }}
          >
            {tabHeaders.map((header) => (
              <React.Fragment key={header.id}>{header.content}</React.Fragment>
            ))}
          </div>
        )}
      </div>

      {/* Active step content */}
      {activeContent && (
        <div className="flex-1 min-h-0 overflow-auto mt-4">{activeContent}</div>
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
      {stepperElement}
    </CommonHeaderAndTooltip>
  );
};
