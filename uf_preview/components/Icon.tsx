"use client";

import React from "react";
import Image from "next/image";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import * as ReactIconsMd from "react-icons/md";
import * as ReactIconsIo from "react-icons/io";
import * as ReactIconsFa from "react-icons/fa";
import * as ReactIconsIo5 from "react-icons/io5";
import * as ReactIconsRX  from "react-icons/rx";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";
import { getCdnImage } from "@/app/utils/getAssets";

type ContentAlign = "left" | "center" | "right";

interface IconProps {
  data?: string;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  size?: number;
  headerPosition?: HeaderPosition;
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
}
const getIconComponent = (iconName?: string) => {
  if (!iconName) return null;
  const MdIcon = (ReactIconsMd as any)[iconName];
  if (MdIcon) return MdIcon;
  const FaIcon = (ReactIconsFa as any)[iconName];
  if (FaIcon) return FaIcon;
  const Io5Icon = (ReactIconsIo5 as any)[iconName];
  if (Io5Icon) return Io5Icon;
  const IoIcon = (ReactIconsIo as any)[iconName];
  if (IoIcon) return IoIcon;
  const RxIcon = (ReactIconsRX as any)[iconName];
  if (RxIcon) return RxIcon;
  return null;
};

// `data` can either be a react-icons component name (e.g. "FaRegUser") or a
// server-relative/absolute path to an image asset (e.g.
// "/torus/9.1/CT001/resources/images/xyz.jpg"). Treat it as an image path
// when it contains a path separator or ends with a known image extension.
const isImagePath = (data?: string) =>
  !!data &&
  (data.includes("/") || /\.(png|jpe?g|gif|webp|bmp|svg|jfif)$/i.test(data));

export const Icon: React.FC<IconProps> = ({
  data,
  size,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
  onClick,
  fillContainer = true,
  contentAlign = "center",
}) => {
  const { theme } = useGlobal();
  const isDark = theme === "dark" || theme === "dark-hc";

  const getFillClasses = () => {
    if (!fillContainer) return "";
    return "w-full h-full";
  };

  const getContentAlignClasses = () => {
    switch (contentAlign) {
      case "left":
        return "justify-start items-start";
      case "right":
        return "justify-end items-end";
      case "center":
      default:
        return "justify-center items-center";
    }
  };
  const isImage = isImagePath(data);
  const IconComponent = isImage ? null : getIconComponent(data);

  const iconElement = isImage ? (
    <div
      className={`
        ${fillContainer ? "w-full h-full" : "flex w-full h-full"}
        flex items-center justify-center
      `}
      onClick={onClick}
    >
      <Image
        src={getCdnImage(data as string)}
        alt=""
        width={size || 100}
        height={size || 100}
        className={fillContainer ? "h-full w-full object-contain" : ""}
        style={!fillContainer ? { width: size || "1em", height: size || "1em" } : undefined}
      />
    </div>
  ) : IconComponent ? (
    <div
      className={`
        ${fillContainer ? "w-full h-full" : "flex w-full h-full"}
        flex items-center justify-center
      `}
      style={!size && !fillContainer ? { fontSize: "var(--font-size-base)" } : undefined}
      onClick={onClick}
    >
      <IconComponent
        size={size}
        className={fillContainer ? "w-full h-full" : ""}
        style={!size && !fillContainer ? { width: "1em", height: "1em" } : undefined}
      />
    </div>
  ) : (
    <div
      className="flex items-center justify-center"
      onClick={onClick}
    >
      <svg
        width={size || "100%"}
        height={size || "100%"}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
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
            {iconElement}
          </CommonHeaderAndTooltip>
        )
};
