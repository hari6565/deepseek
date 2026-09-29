"use client";

import React, { useEffect, useCallback, forwardRef } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { useEventBus } from "@/context/EventBusContext";
import { Icon } from "@/components/Icon";
import { Tooltip } from "@/components/Tooltip";
import {
  ButtonView,
  ButtonPin,
  HeaderPosition,
  TooltipProps as TooltipPropsType,
  ComponentEvents,
} from "@/types/global";
import {
  getBorderRadiusClass,
} from "@/app/utils/branding";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

type IconDisplay = "Icon only" | "Start with Icon" | "End with Icon";
type ContentAlign = "left" | "center" | "right";

interface ButtonProps {
  nodeId?: any;
  view?: ButtonView;
  icon?: string;
  disabled?: boolean;
  pin?: ButtonPin;
  iconDisplay?: IconDisplay;
  isRecordLevel?: boolean;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  children?: React.ReactNode;
  onClick?: (e?:any) => void;
  onFocus?: () => void;
  events?: ComponentEvents[];
  className?: string;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  nodeId,
  view = "action",
  icon,
  disabled = false,
  pin = "circle-circle",
  iconDisplay = "End with Icon",
  isRecordLevel = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  children,
  onClick,
  onFocus,
  events = [],
  className = "",
  startContent,
  endContent,
  fillContainer = true,
  contentAlign = "center"
}, ref) => {
  const { theme, direction } = useGlobal();
  const { emit, subscribe, subscribeGlobal } = useEventBus();

  // Setup event listeners
  useEffect(() => {
    if (!events || events.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    events.forEach((event) => {
      if (event.enabled && event.riseListen) {
        event.riseListen.forEach((listener) => {
          if (listener.listenerType === "type1") {
            // Global listener
            const unsubscribe = subscribeGlobal(listener.key, (payload) => {
              handleEventAction(listener.key, payload);
            });
            unsubscribers.push(unsubscribe);
          } else if (listener.listenerType === "type2") {
            // Node-specific listener
            const unsubscribe = subscribe(listener.key, nodeId, (payload) => {
              handleEventAction(listener.key, payload);
            });
            unsubscribers.push(unsubscribe);
          }
        });
      }
    });

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [nodeId, events, subscribe, subscribeGlobal]);

  const handleEventAction = useCallback((eventKey: string, payload: any) => {
    console.log(`Button ${nodeId} received event:`, eventKey, payload);

    switch (eventKey) {
      case "triggerButtonClick":
        handleClick();
        break;
      case "disableElement":
        // Would need state management to dynamically disable
        break;
      case "enableElement":
        // Would need state management to dynamically enable
        break;
      case "hideElement":
        // Would need state management to hide/show
        break;
      case "showElement":
        // Would need state management to hide/show
        break;
      default:
        console.log(`Unhandled event action: ${eventKey}`);
    }
  }, [nodeId]);

  const handleClick = useCallback((e?:any) => {
    if (disabled) return;

    // Call provided onClick handler
    if (onClick) {
      onClick(e);
    }

    // Emit events based on configuration
    const clickEvent = events.find((e) => e.name === "onClick");
    if (clickEvent && clickEvent.enabled && clickEvent.rise) {
      clickEvent.rise.forEach((riseConfig) => {
        emit(riseConfig.key, {
          nodeId,
          data: { action: riseConfig.key },
        });
      });
    }
  }, [disabled, onClick, events, emit, nodeId]);

  const handleFocus = useCallback(() => {
    if (disabled) return;

    // Call provided onFocus handler
    if (onFocus) {
      onFocus();
    }

    // Emit events based on configuration
    const focusEvent = events.find((e) => e.name === "onFocus");
    if (focusEvent && focusEvent.enabled && focusEvent.rise) {
      focusEvent.rise.forEach((riseConfig) => {
        emit(riseConfig.key, {
          nodeId,
          data: { action: riseConfig.key },
        });
      });
    }
  }, [disabled, onFocus, events, emit, nodeId]);


  const getViewClasses = () => {
    const isDark = theme === "dark" || theme === "dark-hc";
    const isHighContrast = theme === "light-hc" || theme === "dark-hc";

    switch (view) {
      case "normal":
        return isDark ? "text-white" : "text-white";
      case "action":
        return isDark
          ? "text-white"
          : "text-white";
      case "outlined":
        return isDark
          ? "border-2 text-white"
          : "border-2 text-white";
      case "outlined-info":
        return isDark
          ? "border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-900"
          : "border-2 border-cyan-500 text-cyan-600 hover:bg-cyan-50";
      case "outlined-success":
        return isDark
          ? "border-2 border-green-500 text-green-400 hover:bg-green-900"
          : "border-2 border-green-500 text-green-600 hover:bg-green-50";
      case "outlined-warning":
        return isDark
          ? "border-2 border-yellow-500 text-yellow-400 hover:bg-yellow-900"
          : "border-2 border-yellow-500 text-yellow-600 hover:bg-yellow-50";
      case "outlined-danger":
        return isDark
          ? "border-2 border-red-500 text-red-400 hover:bg-red-900"
          : "border-2 border-red-500 text-red-600 hover:bg-red-50";
      case "outlined-utility":
        return isDark
          ? "border-2 border-violet-500 text-violet-400 hover:bg-violet-900"
          : "border-2 border-violet-500 text-violet-600 hover:bg-violet-50";
      case "outlined-action":
        return isDark
          ? "border-2 border-green-500 text-green-400 hover:bg-green-900"
          : "border-2 border-green-500 text-green-600 hover:bg-green-50";
      case "raised":
        return isDark
          ? "bg-gray-700 text-white shadow-lg hover:bg-gray-600"
          : "bg-white text-gray-900 shadow-lg hover:bg-gray-100";
      case "flat":
        return isDark
          ? "bg-transparent text-white hover:bg-gray-800"
          : "bg-transparent text-white hover:bg-gray-100";
      case "flat-secondary":
        return isDark
          ? "bg-transparent text-gray-400 hover:bg-gray-800"
          : "bg-transparent text-gray-600 hover:bg-gray-100";
      case "flat-info":
        return isDark
          ? "bg-transparent text-cyan-400 hover:bg-cyan-900"
          : "bg-transparent text-cyan-600 hover:bg-cyan-50";
      case "flat-success":
        return isDark
          ? "bg-transparent text-green-400 hover:bg-green-900"
          : "bg-transparent text-green-600 hover:bg-green-50";
      case "flat-warning":
        return isDark
          ? "bg-transparent text-yellow-400 hover:bg-yellow-900"
          : "bg-transparent text-yellow-600 hover:bg-yellow-50";
      case "flat-danger":
        return isDark
          ? "bg-transparent text-red-400 hover:bg-red-900"
          : "bg-transparent text-red-600 hover:bg-red-50";
      case "flat-utility":
        return isDark
          ? "bg-transparent text-violet-400 hover:bg-violet-900"
          : "bg-transparent text-violet-600 hover:bg-violet-50";
      case "flat-action":
        return isDark
          ? "bg-transparent text-green-400 hover:bg-green-900"
          : "bg-transparent text-green-600 hover:bg-green-50";
      case "normal-contrast":
        return "text-black";
      case "outlined-contrast":
        return isHighContrast
          ? "border-4 border-black text-black hover:bg-gray-100"
          : isDark
          ? "border-2 border-white text-white hover:bg-gray-800"
          : "border-2 border-black text-black hover:bg-gray-100";
      case "flat-contrast":
        return isHighContrast
          ? "bg-transparent text-black hover:bg-gray-200 font-bold"
          : isDark
          ? "bg-transparent text-white hover:bg-gray-800"
          : "bg-transparent text-black hover:bg-gray-100";
      default:
        return "";
    }
  };

  const getPinClasses = () => {
    const [left, right] = pin.split("-");
    const baseRadius = "var(--border-radius)";

    // Override based on pin style
    if (pin === "circle-circle") {
      return "rounded-full";
    }

    const leftRadius =
      left === "round"
        ? "rounded-l-full"
        : left === "brick"
        ? "rounded-l-none"
        : left === "circle"
        ? "rounded-l-full"
        : left === "clear"
        ? "rounded-l-none"
        : `rounded-l${baseRadius.replace("rounded", "")}`;
    const rightRadius =
      right === "round"
        ? "rounded-r-full"
        : right === "brick"
        ? "rounded-r-none"
        : right === "circle"
        ? "rounded-r-full"
        : right === "clear"
        ? "rounded-r-none"
        : `rounded-r${baseRadius.replace("rounded", "")}`;

    if (pin === "clear-clear") {
      return baseRadius;
    }

    return `${leftRadius} ${rightRadius}`;
  };

  const getButtonStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    // Apply brand color for normal and flat views
    if (view === "normal") {
      styles.backgroundColor = "#d1d5db"; // light grey color
      if (!disabled) {
        styles.transition = "all 0.2s ease";
      }
    } else if (view === "action") {
      styles.borderColor = "var(--brand-color)";
      styles.backgroundColor = "var(--brand-color)";
    } else if (view === "outlined") {
      styles.borderColor = "#d1d5db";
      styles.color = "#d1d5db";
    } else if (view === "outlined-action") {
      styles.borderColor = "var(--brand-color)";
      styles.color = "var(--brand-color)";
    }else if (view === "flat") {
      styles.color = "#d1d5db";
    }else if (view === "flat-action") {
      styles.color = "var(--brand-color)";
    } else if (view === "normal-contrast") {
      styles.backgroundColor = "#FAFAFA";
      if (!disabled) {
        styles.transition = "all 0.2s ease";
      }
    }

    // Handle clear pin sides - remove border on that side
    const [left, right] = pin.split("-");
    if (left === "clear") {
      styles.borderLeftWidth = "0";
    }
    if (right === "clear") {
      styles.borderRightWidth = "0";
    }

    return styles;
  };

  const getHoverStyles = (): string => {
    if (disabled) return "";

    if (view === "normal") {
      return "transition-all hover:opacity-90";
    } else if (view === "outlined" || view === "flat") {
      return "transition-all ";
    }

    return "";
  };

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <span
        className="inline-flex flex-shrink-0 items-center justify-center"
      >
        <Icon data={icon} className="w-full h-full" />
      </span>
    );
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

  const renderContent = () => {
    const iconElement = renderIcon();

    // Apply expanded font size when fillContainer is true
    // Don't apply default font size if className is provided (to allow override)
    const textClassName = fillContainer
      ? `flex-1 text-center`
      : "truncate";

    const textElement = children && <span className={textClassName}>{children}</span>;

    if (iconDisplay === "Icon only") {
      return (
        <>
          {startContent}
          {fillContainer ? <div className="flex items-center justify-center">{iconElement}</div> : iconElement}
          {endContent}
        </>
      );
    } else if (iconDisplay === "Start with Icon") {
      return (
        <>
          {startContent}
          {fillContainer ? <div className="flex items-center justify-center">{iconElement}</div> : iconElement}
          {textElement && (
            <span className={fillContainer ? "flex items-center justify-center" : (direction === "RTL" ? "mr-2" : "ml-2")}>{textElement}</span>
          )}
          {endContent}
        </>
      )
    } else {
      // "End with Icon"
      return (
        <>
          {startContent}
          {textElement && (
            <span className={fillContainer ? " flex items-center justify-center" : ""}>{textElement}</span>
          )}
          {iconElement && (
            <span className={fillContainer ? "flex items-center justify-center" : (direction === "RTL" ? "mr-2" : "ml-2")}>{iconElement}</span>
          )}
          {endContent}
        </>
      );
    }
  };


  const buttonElement = (
    <button
      ref={ref}
      onClick={handleClick}
      onFocus={handleFocus}
      disabled={disabled}
      style={getButtonStyles()}
      className={`
        inline-flex items-center font-medium
        ${getViewClasses()}
        ${getPinClasses()}
        ${getHoverStyles()}
        ${getContentAlignClasses()}
        ${getFillClasses()}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${isRecordLevel ? "relative overflow-hidden" : ""}
        gap-x-1
        ${className}
      `}
      dir={direction}
      onMouseEnter={(e) => {
        if (!disabled) {
          // Use appropriate hover color based on view type
          if (view === "outlined-utility" || view === "flat-utility") {
            const isDark = theme === "dark" || theme === "dark-hc";
            e.currentTarget.style.backgroundColor = isDark ? "rgb(76 29 149)" : "rgb(245 243 255)"; // violet-900 : violet-50
          } else {
            e.currentTarget.style.backgroundColor = "var(--hover-color)";
          }
        }
      }}
      onMouseLeave={(e) => {
          if (!disabled && (view.startsWith("outlined") || view.startsWith( "flat") || view === "raised")) {
            e.currentTarget.style.backgroundColor = "transparent";
          } else if (view === "normal") {
            e.currentTarget.style.backgroundColor = "#d1d5db"; // light grey color
          } else if (view === "normal-contrast") {
            e.currentTarget.style.backgroundColor = "#FAFAFA";
          } else if (view === "action") {
            e.currentTarget.style.backgroundColor = "var(--brand-color)";
          }
      }}
    >
      {renderContent()}
      {isRecordLevel && (
        <span className="absolute bottom-0 left-0 right-0 h-1 bg-red-500"></span>
      )}
    </button>
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
       {buttonElement}
     </CommonHeaderAndTooltip>
   )
});

Button.displayName = "Button";
