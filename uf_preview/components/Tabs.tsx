"use client";

import React, { useState } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { Icon } from "./Icon";
import { GravityIcon } from "@/types/icons";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { getBorderRadiusClass } from "@/app/utils/branding";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

type TabDirection = "horizontal" | "vertical";
type HeaderAlignment = "left" | "center" | "right" | "full";

interface TabItem {
  id: string;
  title: string;
  icon?: GravityIcon;
  content?: React.ReactNode;
}

interface TabsProps {
  items: TabItem[];
  security:any[],
  direction?: TabDirection;
  disabled?: boolean;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  headerAlignment?: HeaderAlignment;
  headerClassName?: string;
  defaultActiveId?: string;
  activeTab?: string;
  onChange?: (id: any) => void;
  className?: string;
  tabHeaders?: TabItem[];
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  security,
  direction,
  disabled = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  headerAlignment = "full",
  defaultActiveId,
  activeTab: activeTabProp,
  onChange=()=>{},
  className = "",
  headerClassName = "",
  tabHeaders=[],
}) => {
  const { theme, branding } = useGlobal();
  const [activeTab, setActiveTab] = useState(defaultActiveId || items[0]?.id || "");

  const currentActiveTab = activeTabProp ?? activeTab;

  const handleTabClick = (id: string) => {
      onChange(id);
      setActiveTab(id);

  };

  const getSizeClasses = () => {
    return `px-4 py-2 `;
  };

  const isDark = theme === "dark" || theme === "dark-hc";

  const activeContent = items.find(item => item.id === currentActiveTab)?.content;

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16);
    const g = parseInt(hex?.slice(3, 5), 16);
    const b = parseInt(hex?.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Get justify class based on alignment
  const getJustifyClass = () => {
    if (direction === "vertical") return "";
    switch (headerAlignment) {
      case "left":
        return "justify-start";
      case "center":
        return "justify-center";
      case "right":
        return "justify-end";
      case "full":
      default:
        return "";
    }
  };

  const tabsElement = (
    <div className={`w-full h-full flex ${direction === "vertical" ? "flex-row gap-4" : "flex-col"}`}>
      <div
        className={`
          flex-shrink-0
          flex
          overflow-hidden
          ${direction === "vertical" ? "flex-col" : "flex-row"}
          ${direction === "vertical" ? "w-auto" : "w-full"}
          p-1
          mt-2
           ${headerClassName}
          ${getJustifyClass()}
        `}
      >
        <div
          className={`
            flex
            ${direction === "vertical" ? "flex-col" : "flex-row"}            
            rounded-full
            p-2
            bg-white
            ${headerAlignment === 'full' ? 'w-full' : 'w-fit'}
          `}
        >
        {items.map((item) => {
          const isActive = currentActiveTab === item.id;
          if(security?.includes(item.id))
          {
            
            return (
              <button
                key={item.id}
                onClick={()=> handleTabClick(item.id)}
                disabled={disabled}
                className={`
                  ${getSizeClasses()}
                  rounded-full
                  flex items-center justify-center gap-2
                  font-medium
                  whitespace-nowrap
                  transition-all
                  ${direction === "vertical" ? "" : headerAlignment === "full" ? "flex-1" : ""}
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                  ${isActive
                    ? "text-white shadow-sm"
                    : isDark ? "text-gray-300 hover:text-white" : "text-gray-700 hover:text-gray-900"
                  }
                `}
                style={{
                  backgroundColor: isActive ? branding.brandColor : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!disabled && !isActive) {
                    e.currentTarget.style.backgroundColor = hexToRgba(branding.hoverColor, 0.25);
                  }
                }}
                onMouseLeave={(e) => {
                  if (!disabled && !isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
                onFocus={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${hexToRgba(branding.selectionColor, 0.3)}`;
                  }
                }}
                onBlur={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {item.icon && <Icon data={item.icon} size={16} />}
                {item.title}
              </button>
            );
          }
        })}
        </div>
        {tabHeaders && tabHeaders.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(24, 1fr)',
              gridTemplateRows: 'repeat(auto-fill, 4px)',
              columnGap: '8px',
              flex: 1,
              placeItems:'stretch',
              gridAutoRows:'4px',
              overflow:'hidden'
            }}
          >
            {tabHeaders.map((header) => (
              <React.Fragment key={header.id}>
                {header.content}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      {activeContent && (
        <div className={`flex-1 min-h-0 overflow-auto ${direction === "vertical" ? "" : "mt-4"}`}>
          {activeContent}
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
         {tabsElement}
       </CommonHeaderAndTooltip>
     )
}; 