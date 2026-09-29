"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { useEventBus } from "@/context/EventBusContext";
import {
  ComponentSize,
  ComponentEvents,
} from "@/types/global";
import {
  getBorderRadiusClass,
} from "@/app/utils/branding";
import { IoChevronBackOutline, IoChevronForward } from "react-icons/io5";

export interface DropdownMenuItem {
  text: string;
  action?: () => void;
  icon?: string;
  disabled?: boolean;
  items?: DropdownMenuItem[]; // For nested menus
  divider?: boolean; // Show divider before this item
}

interface DropdownMenuProps {
  nodeId?: any;
  renderSwitcher: (props: DropdownSwitcherProps) => React.ReactNode;
  items: DropdownMenuItem[];
  popupProps?: {
    style?: React.CSSProperties;
    className?: string;
  };
  size?: ComponentSize;
  disabled?: boolean;
  events?: ComponentEvents[];
  className?: string;
  onOpenChange?: (open: boolean) => void;
  useBrandColor?: boolean; // Apply brand color to hover states
}

export interface DropdownSwitcherProps {
  onClick: () => void;
  ref: React.RefObject<HTMLElement>;
  'aria-expanded': boolean;
  'aria-haspopup': boolean;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({
  nodeId,
  renderSwitcher,
  items,
  popupProps = {},
  size = "m",
  disabled = false,
  events = [],
  className = "",
  onOpenChange,
  useBrandColor = true,
}) => {
  const { theme, direction, branding } = useGlobal();
  const { emit, subscribe, subscribeGlobal } = useEventBus();
  const [isOpen, setIsOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const switcherRef = useRef<HTMLElement>(null);

  const isDark = theme === "dark" || theme === "dark-hc";
  const isHighContrast = theme === "light-hc" || theme === "dark-hc";

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
    console.log(`DropdownMenu ${nodeId} received event:`, eventKey, payload);

    switch (eventKey) {
      case "openDropdown":
        setIsOpen(true);
        break;
      case "closeDropdown":
        setIsOpen(false);
        break;
      case "toggleDropdown":
        setIsOpen((prev) => !prev);
        break;
      default:
        console.log(`Unhandled event action: ${eventKey}`);
    }
  }, [nodeId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setActiveSubmenu(null);
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  // Notify parent of open state change
  useEffect(() => {
    if (onOpenChange) {
      onOpenChange(isOpen);
    }

    // Emit event when dropdown opens/closes
    const openEvent = events.find((e) => e.name === "onOpenChange");
    if (openEvent && openEvent.enabled && openEvent.rise) {
      openEvent.rise.forEach((riseConfig) => {
        emit(riseConfig.key, {
          nodeId,
          data: { open: isOpen },
        });
      });
    }
  }, [isOpen, onOpenChange, events, emit, nodeId]);

  const toggleDropdown = useCallback(() => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
    setActiveSubmenu(null);

    // Emit click event
    const clickEvent = events.find((e) => e.name === "onClick");
    if (clickEvent && clickEvent.enabled && clickEvent.rise) {
      clickEvent.rise.forEach((riseConfig) => {
        emit(riseConfig.key, {
          nodeId,
          data: { action: "toggle" },
        });
      });
    }
  }, [disabled, events, emit, nodeId]);

  const handleItemClick = useCallback((item: DropdownMenuItem) => {
    if (item.disabled) return;

    if (item.action) {
      item.action();
    }

    // Close dropdown after item click (unless it has subitems)
    if (!item.items || item.items.length === 0) {
      setIsOpen(false);
      setActiveSubmenu(null);
    }
  }, []);

  const getPopupStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: isDark ? "#1f2937" : "#ffffff",
      color: isDark ? "#ffffff" : "#000000",
      borderColor: isDark ? "#4B5563" : "#D1D5DB",
    };

    return {
      ...baseStyles,
      ...popupProps.style,
    };
  };

  const getPopupClasses = () => {
    const borderRadius = getBorderRadiusClass(branding.borderRadius);

    return `
      absolute z-50 mt-2 min-w-[160px] shadow-lg border rounded-md
      ${borderRadius}
      ${isDark ? "border-gray-600" : "border-gray-300"}
      ${isHighContrast ? "border-2" : "border"}
      ${popupProps.className || ""}
    `;
  };

  const getItemClasses = (item: DropdownMenuItem, hasSubmenu: boolean) => {
    const baseClasses = `
      flex items-center justify-between px-4 py-2 cursor-pointer rounded-md
      transition-colors duration-150
      ${item.disabled ? "opacity-50 cursor-not-allowed" : ""}
    `;

    const hoverClasses = item.disabled
      ? ""
      : isDark
      ? "hover:bg-gray-700"
      : "hover:bg-gray-100";

    return `${baseClasses} ${hoverClasses}`;
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

  const renderMenuItem = (item: DropdownMenuItem, index: number, level: number = 0) => {
    if (item.divider) {
      return (
        <div
          key={`divider-${index}`}
          className={`my-1 border-t ${isDark ? "border-gray-600" : "border-gray-300"}`}
        />
      );
    }

    const hasSubmenu = item.items && item.items.length > 0;
    const isSubmenuActive = activeSubmenu === index;

    return (
      <div key={index} className="relative">
        <div
          className={getItemClasses(item, hasSubmenu as boolean)}
          onClick={() => {
            if (hasSubmenu) {
              setActiveSubmenu(isSubmenuActive ? null : index);
            } else {
              handleItemClick(item);
            }
          }}
          onMouseEnter={(e) => {
            if (!item.disabled) {
              e.currentTarget.style.backgroundColor = useBrandColor
                ? branding.hoverColor
                : branding.brandColor;
              if (useBrandColor) {
                e.currentTarget.style.color = getContrastColor(branding.brandColor);
              }
            }
          }}
          onMouseLeave={(e) => {
            if (!item.disabled) {
              const popupStyles = getPopupStyles();
              e.currentTarget.style.backgroundColor = (popupStyles.backgroundColor as string) || (isDark ? "#1f2937" : "#ffffff");
              e.currentTarget.style.color = (popupStyles.color as string) || (isDark ? "#ffffff" : "#000000");
            }
          }}
        >
          <div className="flex items-center gap-2 rounded-md">
            {item.icon && (
              <>{item.icon}</>
            )}
            <span>{item.text}</span>
          </div>
          {hasSubmenu && (
            direction === "RTL" ? (
              <IoChevronBackOutline />
            ) : (
              <IoChevronForward />
            )
          )}
        </div>

        {/* Render submenu */}
        {hasSubmenu && isSubmenuActive && (
          <div
            className={`${getPopupClasses()} ${direction === "RTL" ? "right-full mr-2" : "left-full ml-2"} rounded-md top-0`}
            style={getPopupStyles()}
          >
            {item.items!.map((subItem, subIndex) =>
              renderMenuItem(subItem, subIndex, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  const switcherProps: DropdownSwitcherProps = {
    onClick: toggleDropdown,
    ref: switcherRef as React.RefObject<HTMLElement>,
    'aria-expanded': isOpen,
    'aria-haspopup': true,
  };

  return (
    <div
      ref={dropdownRef}
      className={`relative inline-block rounded-md ${className}`}
      dir={direction}
    >
      {/* Render switcher button */}
      {renderSwitcher(switcherProps)}

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={getPopupClasses()}
          style={getPopupStyles()}
        >
          {items.map((item, index) => renderMenuItem(item, index))}
        </div>
      )}
    </div>
  );
};
