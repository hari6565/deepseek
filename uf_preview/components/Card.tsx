"use client";

import React from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { Icon } from "./Icon";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

type CardTheme = "normal" | "info" | "success" | "warning" | "danger" | "utility" | "brand";
type CardView = "outlined" | "clear" | "filled" | "raised";
type CardType = "selection" | "action" | "container";
type ContentAlign = "left" | "center" | "right";

interface CardProps {
  theme?: CardTheme;
  view?: CardView;
  type?: CardType;
  disabled?: boolean;
  selected?: boolean;
  title?: string;
  prefixValue?: string;
  label?: string;
  icon?: string | React.ReactNode;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  children?: string | React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  className?: string;
  style?: React.CSSProperties;
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
}

export const Card: React.FC<CardProps> = ({
  theme: cardTheme = "normal",
  view = "filled",
  type = "container",
  disabled = false,
  selected = false,
  title,
  prefixValue,
  label,
  icon,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  children,
  onClick,
  className = "",
  style = {},
  fillContainer = true,
  contentAlign = "center"
}) => {
  const { theme, direction } = useGlobal();

  const getThemeColors = () => {
    const isDark = theme === "dark" || theme === "dark-hc";

    switch (cardTheme) {
      case "info":
        return { bg: isDark ? "#1E3A8A" : "#DBEAFE", border: "#3B82F6", text: isDark ? "#BFDBFE" : "#1E40AF" };
      case "success":
        return { bg: isDark ? "#166534" : "#DCFCE7", border: "#22C55E", text: isDark ? "#BBF7D0" : "#166534" };
      case "warning":
        return { bg: isDark ? "#854D0E" : "#FEF3C7", border: "#F59E0B", text: isDark ? "#FDE68A" : "#854D0E" };
      case "danger":
        return { bg: isDark ? "#991B1B" : "#FEE2E2", border: "#EF4444", text: isDark ? "#FECACA" : "#991B1B" };
      case "utility":
        return { bg: isDark ? "#374151" : "#F3F4F6", border: "#6B7280", text: isDark ? "#D1D5DB" : "#374151" };
      case "normal":
        return { bg: "#f2f2f2", text: isDark ? "#D1D5DB" : "#374151"}
      case "brand":
        return { bg: "var(--brand-color)", border: "var(--brand-color)", text: isDark ? "#F9FAFB" : "#111827" };
      default:
        return { bg: isDark ? "#1F2937" : "#FFFFFF", border: isDark ? "#4B5563" : "##E5E7EB", text: isDark ? "#F9FAFB" : "#111827" };
    }
  };

  const colors = getThemeColors();
  const isDark = theme === "dark" || theme === "dark-hc";
  const getFillClasses = () => {
    if (!fillContainer) return "";
    return "w-full h-full";
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



  const cardElement = (
    <div
      onClick={disabled ? undefined : onClick}
      className={`
        flex flex-col justify-around
        ${view === "outlined" ? "border-2" : view === "filled" ? "border" : ""}
        ${selected ? "ring-2 ring-offset-2" : ""}
        ${disabled ? "opacity-50 cursor-not-allowed" : onClick ? "cursor-pointer hover:shadow-md" : ""}
        ${type === "selection" && selected ? "border-2" : ""}
        transition-all duration-200
        ${getContentAlignClasses()}
        ${getFillClasses()}
        ${className}
      `}
      style={{
        backgroundColor: view === "filled" ? colors.bg : view === "clear" ? "transparent" : isDark ? "#1F2937" : "#FFFFFF",
        borderColor: selected ? "var(--selection-color)" : view === "outlined" || view === "filled" ? colors.border : "transparent",
        color: colors.text,
        fontFamily: "var(--font-body)",
        borderRadius: "var(--border-radius)",
        boxSizing: "border-box",
        padding: "min(12px, 3%)",
        gap: "min(12px, 2%)",
        ...(view === "raised"? {boxShadow:"inset 0 -2px 4px rgba(0, 0, 0, 0.2), inset 0 2px 4px rgba(255, 255, 255, 0.25), 0 2px 4px rgba(0, 0, 0, 0.2)",}: {}),
        ...(selected ? { '--tw-ring-color': 'var(--selection-color)' } as any : {}),
        ...style,
      }}
    >
      {/* Title Section */}
      {title && (
        <div className={`font-semibold border-b flex-shrink-0`}
        style={{
          borderColor: isDark ? "#374151" : "#E5E7EB",
          paddingBottom: "min(8px, 2%)"
        }}>
          {title}
        </div>
      )}

      {/* Icon and Prefix Section */}
      {(icon || label) && (
        <div className={`flex items-center flex-shrink-0 ${getContentAlignClasses()}`} style={{ gap: "min(8px, 2%)" }}>
          {icon && (
            <div className="flex items-center justify-center flex-shrink-0">
              {typeof icon === "string" ? (
                <span style={{ width: "1em", height: "1em", fontSize: "var(--font-size-base)", display: "inline-flex" }}>
                  <Icon data={icon} fillContainer className="flex-shrink-0" />
                </span>
              ) : (
                icon
              )}
            </div>
          )}
          {label && (
            <span className="font-semibold flex items-center">{label}</span>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className={`flex flex-end min-h-0 ${getContentAlignClasses()}`}>
        {prefixValue && (
            <span className="font-semibold flex items-center">{prefixValue}</span>
          )}{children}
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
      fillContainer={fillContainer}
    >
      {cardElement}
    </CommonHeaderAndTooltip>
  )
};
