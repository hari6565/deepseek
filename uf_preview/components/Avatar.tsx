"use client";

import React from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { Icon } from "./Icon";
import { AvatarView, AvatarTheme, AvatarShape, HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";
import Image from "next/image";
// import { GravityIcon } from "@/types/icons";

type ContentAlign = "left" | "center" | "right";

interface AvatarProps {
  imageUrl?: string;
  icon?: string;
  text?: string;
  view?: AvatarView;
  theme?: AvatarTheme;
  shape?: AvatarShape;
  backgroundColor?: string;
  borderColor?: string;
  fallbackImgUrl?: string;
  alt?: string;
  withImageBorder?: boolean;
  color?: string;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  className?: string;
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
}

export const Avatar: React.FC<AvatarProps> = ({
  imageUrl,
  icon,
  text,
  view,
  theme: avatarTheme,
  shape = "circle",
  backgroundColor,
  borderColor,
  fallbackImgUrl,
  alt = "",
  withImageBorder = false,
  color,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
  fillContainer = true,
  contentAlign = "center",
}) => {
  const { theme, direction } = useGlobal();

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;

    // For outlined view, use transparent or base color instead of brand color
    if (view === "outlined") {
      const isDark = theme === "dark" || theme === "dark-hc";
      return isDark ? "#1F2937" : "#F9FAFB";
    }

    if (avatarTheme === "brand") {
      return 'var(--brand-color)';
    }

    const isDark = theme === "dark" || theme === "dark-hc";
    return isDark ? "#4B5563" : "#E5E7EB";
  };

  const getTextColor = () => {
    if (color) return color;

    // For outlined view with brand theme, use brand color for text/icon
    if (view === "outlined" && avatarTheme === "brand") {
      return 'var(--brand-color)';
    }

    if (avatarTheme === "brand") {
      return "white";
    }

    const isDark = theme === "dark" || theme === "dark-hc";
    return isDark ? "white" : "#1F2937";
  };

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

  const getBorderStyle = () => {
    if (view === "outlined") {
      return {
        borderWidth: "2px",
        borderColor: borderColor || (avatarTheme === "brand" ? 'var(--brand-color)' : theme === "dark" || theme === "dark-hc" ? "#6B7280" : "#D1D5DB"),
      };
    }
    
    if (withImageBorder && imageUrl) {
      return {
        borderWidth: "2px",
        borderColor: borderColor || 'var(--brand-color)',
      };
    }
    
    return {};
  };



  const avatarElement = (
    <div
      className={`
        ${shape === "circle" ? "rounded-full" : "rounded-lg"}
        flex items-center
        font-semibold
        overflow-hidden
        transition-all
        ${view === "outlined" ? "border-2" : ""}
        ${className}
        ${getFillClasses()}
        ${getContentAlignClasses()}
        `}
      dir={direction}
      style={{
        backgroundColor: imageUrl ? "transparent" : getBackgroundColor(),
        color: getTextColor(),
        ...getBorderStyle(),
      }}
    >
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={alt}
          width={100}
          height={100}
          className={`h-full object-contain ${contentAlign === "center" ? "w-full" : ""}`}
          onError={(e) => {
            if (fallbackImgUrl) {
              e.currentTarget.src = fallbackImgUrl;
            }
          }}
        />
      ) : icon ? (
        <span style={{ width: fillContainer ? "100%" : "1em", height: fillContainer ? "100%" : "1em", display: "inline-flex" }}>
          <Icon
            data={icon}
            fillContainer
            className={`p-2 ${fillContainer ? "w-full h-full" : ""}`}
          />
        </span>
      ) : text ? (
        <span style={{ fontSize: fillContainer ? "clamp(0.5rem, 40%, 2rem)" : undefined }}>{text.charAt(0).toUpperCase()}</span>
      ) : (
        <span style={{ width: fillContainer ? "100%" : "1em", height: fillContainer ? "100%" : "1em", display: "inline-flex" }}>
          <Icon
            data="user"
            fillContainer
            className={`p-2 ${fillContainer ? "w-full h-full" : ""}`}
          />
        </span>
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
      fillContainer={fillContainer}
    >
      {avatarElement}
    </CommonHeaderAndTooltip>
  )
};
