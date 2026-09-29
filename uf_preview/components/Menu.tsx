"use client";

import React, { useCallback, useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { useEventBus } from "@/context/EventBusContext";
import { Icon } from "@/components/Icon";
import {
  ComponentSize,
  ComponentEvents,
} from "@/types/global";
import {
  getBorderRadiusClass,
} from "@/app/utils/branding";
import { useTheme } from "@/hooks/useTheme";

interface MenuProps {
  nodeId?: any;
  size?: ComponentSize;
  className?: string;
  children: React.ReactNode;
  events?: ComponentEvents[];
  orientation?: "vertical" | "horizontal";
  useBrandColor?: boolean; // Apply brand color to active items
}

interface MenuItemProps {
  nodeId?: any;
  iconStart?: string | React.ReactNode;
  iconEnd?: string | React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  events?: ComponentEvents[];
}

const MenuContext = React.createContext<{
  size: ComponentSize;
  orientation: "vertical" | "horizontal";
  useBrandColor: boolean;
}>({
  size: "m",
  orientation: "vertical",
  useBrandColor: true,
});

export const Menu: React.FC<MenuProps> & { Item: React.FC<MenuItemProps> } = ({
  nodeId,
  size = "m",
  className = "",
  children,
  events = [],
  orientation = "vertical",
  useBrandColor = true,
}) => {
  const { theme, direction, branding } = useGlobal();
  const { emit, subscribe, subscribeGlobal } = useEventBus();
  const { bgColor, isDark, isHighContrast } = useTheme()

  // Setup event listeners
  useEffect(() => {
    if (!events || events.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    events.forEach((event) => {
      if (event.enabled && event.riseListen) {
        event.riseListen.forEach((listener) => {
          if (listener.listenerType === "type1") {
            const unsubscribe = subscribeGlobal(listener.key, (payload) => {
              console.log(`Menu ${nodeId} received event:`, listener.key, payload);
            });
            unsubscribers.push(unsubscribe);
          } else if (listener.listenerType === "type2") {
            const unsubscribe = subscribe(listener.key, nodeId, (payload) => {
              console.log(`Menu ${nodeId} received event:`, listener.key, payload);
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

  const getMenuClasses = () => {
    const orientationClasses =
      orientation === "horizontal"
        ? "flex flex-row items-center"
        : "flex flex-col";
    return `${orientationClasses} ${className}`;
  };

  return (
    <MenuContext.Provider value={{ size, orientation, useBrandColor }}>
      <nav className={getMenuClasses()} dir={direction}>
        {children}
      </nav>
    </MenuContext.Provider>
  );
};

const MenuItem: React.FC<MenuItemProps> = ({
  nodeId,
  iconStart,
  iconEnd,
  active = false,
  disabled = false,
  className = "",
  children,
  onClick,
  events = [],
}) => {
  const { theme, direction, branding } = useGlobal();
  const { emit, subscribe, subscribeGlobal } = useEventBus();
  const context = React.useContext(MenuContext);
  const { bgColor, isDark, isHighContrast } = useTheme()

  // Setup event listeners
  useEffect(() => {
    if (!events || events.length === 0) return;

    const unsubscribers: (() => void)[] = [];

    events.forEach((event) => {
      if (event.enabled && event.riseListen) {
        event.riseListen.forEach((listener) => {
          if (listener.listenerType === "type1") {
            const unsubscribe = subscribeGlobal(listener.key, (payload) => {
              handleEventAction(listener.key, payload);
            });
            unsubscribers.push(unsubscribe);
          } else if (listener.listenerType === "type2") {
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
    console.log(`MenuItem ${nodeId} received event:`, eventKey, payload);
  }, [nodeId]);

  const handleClick = useCallback(() => {
    if (disabled) return;

    if (onClick) {
      onClick();
    }

    // Emit click event
    const clickEvent = events.find((e) => e.name === "onClick");
    if (clickEvent && clickEvent.enabled && clickEvent.rise) {
      clickEvent.rise.forEach((riseConfig) => {
        emit(riseConfig.key, {
          nodeId,
          data: { action: "menuItemClick" },
        });
      });
    }
  }, [disabled, onClick, events, emit, nodeId]);

  const getSizeClasses = () => {
    switch (context.size) {
      case "xs": return "px-[0.5em] py-[0.25em]";
      case "s":  return "px-[0.75em] py-[0.375em]";
      case "l":  return "px-[1.25em] py-[0.625em]";
      case "xl": return "px-[1.5em] py-[0.75em]";
      case "m":
      default:   return "px-[1em] py-[0.5em]";
    }
  };

  const getItemClasses = () => {
    const baseClasses = `
      flex items-center gap-2 cursor-pointer transition-all duration-200
      ${getSizeClasses()}
      ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      ${isHighContrast ? "font-semibold" : "font-medium"}
    `;

    // Active state with brand color
    if (active && context.useBrandColor) {
      return `
        ${baseClasses}
        ${className}
      `;
    }

    // Regular inactive state
    const hoverClasses = disabled
      ? ""
      : isDark
      ? "hover:bg-gray-700"
      : "hover:bg-gray-100";

    return `
      ${baseClasses}
      ${isDark ? "text-gray-300" : "text-gray-700"}
      ${hoverClasses}
      ${className}
    `;
  };

  const getItemStyles = (): React.CSSProperties => {
    const styles: React.CSSProperties = {};

    if (active && context.useBrandColor) {
      // Use brand color for active items
      styles.backgroundColor = branding.brandColor;
      styles.color = getContrastColor(branding.brandColor);
    }

    return styles;
  };

  // Helper function to determine if we should use dark or light text
  const getContrastColor = (hexColor: string): string => {
    // Remove # if present
    const hex = hexColor.replace("#", "");

    // Convert to RGB
    const r = parseInt(hex?.substring(0, 2), 16);
    const g = parseInt(hex?.substring(2, 4), 16);
    const b = parseInt(hex?.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black or white based on luminance
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
  };

  const getIconEm = () => {
    switch (context.size) {
      case "xs": return "0.875em";
      case "s":  return "1em";
      case "l":  return "1.25em";
      case "xl": return "1.5em";
      case "m":
      default:   return "1.125em";
    }
  };

  const renderIcon = (iconData: string | React.ReactNode) => {
    if (!iconData) return null;
    if (typeof iconData === "string") {
      return (
        <span style={{ width: getIconEm(), height: getIconEm(), display: "inline-flex", flexShrink: 0 }}>
          <Icon data={iconData} fillContainer className="flex-shrink-0" />
        </span>
      );
    }
    return iconData;
  };

  return (
    <div
      className={getItemClasses()}
      style={getItemStyles()}
      onClick={handleClick}
      dir={direction}
      onMouseEnter={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.backgroundColor = branding.hoverColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !active) {
          e.currentTarget.style.backgroundColor = "transparent";
        } else if (active && context.useBrandColor) {
          e.currentTarget.style.backgroundColor = branding.brandColor;
        }
      }}
    >
      {iconStart && (
        <span className={direction === "RTL" ? "ml-1" : "mr-1"}>
          {renderIcon(iconStart)}
        </span>
      )}
      <span className="flex-1">{children}</span>
      {iconEnd && (
        <span className={direction === "RTL" ? "mr-1" : "ml-1"}>
          {renderIcon(iconEnd)}
        </span>
      )}
    </div>
  );
};

Menu.Item = MenuItem;