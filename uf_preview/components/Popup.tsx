"use client";

import { useTheme } from "@/hooks/useTheme";
import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import ReactDOM from "react-dom";

export type PopupPlacement = 
  | "top" 
  | "top-start" 
  | "top-end"
  | "bottom" 
  | "bottom-start" 
  | "bottom-end"
  | "left" 
  | "left-start" 
  | "left-end"
  | "right" 
  | "right-start" 
  | "right-end";

export type PopupSize = "s" | "m" | "l" | "xl";

interface PopupProps {
  /** Reference to the anchor element */
  anchorRef: React.RefObject<HTMLElement>;
  /** Content to display in the popup */
  children: React.ReactNode;
  /** Whether the popup is open */
  open: boolean;
  /** Callback when popup should close */
  onClose?: () => void;
  /** Placement relative to anchor */
  placement?: PopupPlacement;
  /** Size of the popup */
  size?: PopupSize;
  /** Custom className */
  className?: string;
  /** Whether to show arrow pointing to anchor */
  hasArrow?: boolean;
  /** Whether to close on outside click */
  autoClose?: boolean;
  /** Whether to close on escape key */
  closeOnEscape?: boolean;
  /** Offset from the anchor element */
  offset?: number | [number, number];
  /** Whether to disable portal rendering */
  disablePortal?: boolean;
  /** Z-index for the popup */
  zIndex?: number;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Animation duration in ms */
  animationDuration?: number;
  /** Whether popup should flip when there's no space */
  preventFlip?: boolean;
  /** ID for the popup element */
  id?: string;
}

const sizeClasses = {
  s: "w-48 max-w-48",
  m: "w-64 max-w-64", 
  l: "w-80 max-w-80",
  xl: "w-96 max-w-96"
};

const getArrowClasses = (placement: PopupPlacement, hasArrow: boolean) => {
  if (!hasArrow) return "";
  
  const arrowBase = "absolute w-0 h-0 pointer-events-none";
  
  switch (placement) {
    case "top":
    case "top-start":
    case "top-end":
      return `${arrowBase} top-full left-1/2 transform -translate-x-1/2 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-white dark:border-t-gray-800`;
    
    case "bottom":
    case "bottom-start": 
    case "bottom-end":
      return `${arrowBase} bottom-full left-1/2 transform -translate-x-1/2 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white dark:border-b-gray-800`;
    
    case "left":
    case "left-start":
    case "left-end":
      return `${arrowBase} left-full top-1/2 transform -translate-y-1/2 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-white dark:border-l-gray-800`;
    
    case "right":
    case "right-start":
    case "right-end":
      return `${arrowBase} right-full top-1/2 transform -translate-y-1/2 border-t-[6px] border-b-[6px] border-r-[6px] border-t-transparent border-b-transparent border-r-white dark:border-r-gray-800`;
    
    default:
      return "";
  }
};

const calculatePopupPosition = (
  anchorEl: HTMLElement,
  popupEl: HTMLElement,
  placement: PopupPlacement,
  offset: number | [number, number],
  preventFlip: boolean = false
) => {
  const anchorRect = anchorEl.getBoundingClientRect();
  const popupRect = popupEl.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  const offsetX = Array.isArray(offset) ? offset[0] : offset;
  const offsetY = Array.isArray(offset) ? offset[1] : offset;
  
  let top = 0;
  let left = 0;
  let finalPlacement = placement;
  
  // Calculate position based on placement
  switch (placement) {
    case "top":
      top = anchorRect.top + scrollY - popupRect.height - offsetY;
      left = anchorRect.left + scrollX + (anchorRect.width - popupRect.width) / 2;
      break;
    case "top-start":
      top = anchorRect.top + scrollY - popupRect.height - offsetY;
      left = anchorRect.left + scrollX;
      break;
    case "top-end":
      top = anchorRect.top + scrollY - popupRect.height - offsetY;
      left = anchorRect.right + scrollX - popupRect.width;
      break;
    case "bottom":
      top = anchorRect.bottom + scrollY + offsetY;
      left = anchorRect.left + scrollX + (anchorRect.width - popupRect.width) / 2;
      break;
    case "bottom-start":
      top = anchorRect.bottom + scrollY + offsetY;
      left = anchorRect.left + scrollX;
      break;
    case "bottom-end":
      top = anchorRect.bottom + scrollY + offsetY;
      left = anchorRect.right + scrollX - popupRect.width;
      break;
    case "left":
      top = anchorRect.top + scrollY + (anchorRect.height - popupRect.height) / 2;
      left = anchorRect.left + scrollX - popupRect.width - offsetX;
      break;
    case "left-start":
      top = anchorRect.top + scrollY;
      left = anchorRect.left + scrollX - popupRect.width - offsetX;
      break;
    case "left-end":
      top = anchorRect.bottom + scrollY - popupRect.height;
      left = anchorRect.left + scrollX - popupRect.width - offsetX;
      break;
    case "right":
      top = anchorRect.top + scrollY + (anchorRect.height - popupRect.height) / 2;
      left = anchorRect.right + scrollX + offsetX;
      break;
    case "right-start":
      top = anchorRect.top + scrollY;
      left = anchorRect.right + scrollX + offsetX;
      break;
    case "right-end":
      top = anchorRect.bottom + scrollY - popupRect.height;
      left = anchorRect.right + scrollX + offsetX;
      break;
  }
  
  // Check if we need to flip (only if not prevented)
  if (!preventFlip) {
    const popupViewportTop = top - scrollY;
    const popupViewportLeft = left - scrollX;
    const popupViewportBottom = popupViewportTop + popupRect.height;
    const popupViewportRight = popupViewportLeft + popupRect.width;
    
    // Flip vertically if needed
    if (placement.startsWith('top') && popupViewportTop < 0) {
      const flippedPlacement = placement.replace('top', 'bottom') as PopupPlacement;
      const flippedTop = anchorRect.bottom + scrollY + offsetY;
      if (flippedTop - scrollY + popupRect.height <= viewportHeight) {
        finalPlacement = flippedPlacement;
        top = flippedTop;
      }
    } else if (placement.startsWith('bottom') && popupViewportBottom > viewportHeight) {
      const flippedPlacement = placement.replace('bottom', 'top') as PopupPlacement;
      const flippedTop = anchorRect.top + scrollY - popupRect.height - offsetY;
      if (flippedTop - scrollY >= 0) {
        finalPlacement = flippedPlacement;
        top = flippedTop;
      }
    }
    
    // Flip horizontally if needed
    if (placement.startsWith('left') && popupViewportLeft < 0) {
      const flippedPlacement = placement.replace('left', 'right') as PopupPlacement;
      const flippedLeft = anchorRect.right + scrollX + offsetX;
      if (flippedLeft - scrollX + popupRect.width <= viewportWidth) {
        finalPlacement = flippedPlacement;
        left = flippedLeft;
        // Recalculate top for right placement
        if (flippedPlacement === 'right') {
          top = anchorRect.top + scrollY + (anchorRect.height - popupRect.height) / 2;
        } else if (flippedPlacement === 'right-start') {
          top = anchorRect.top + scrollY;
        } else if (flippedPlacement === 'right-end') {
          top = anchorRect.bottom + scrollY - popupRect.height;
        }
      }
    } else if (placement.startsWith('right') && popupViewportRight > viewportWidth) {
      const flippedPlacement = placement.replace('right', 'left') as PopupPlacement;
      const flippedLeft = anchorRect.left + scrollX - popupRect.width - offsetX;
      if (flippedLeft - scrollX >= 0) {
        finalPlacement = flippedPlacement;
        left = flippedLeft;
        // Recalculate top for left placement
        if (flippedPlacement === 'left') {
          top = anchorRect.top + scrollY + (anchorRect.height - popupRect.height) / 2;
        } else if (flippedPlacement === 'left-start') {
          top = anchorRect.top + scrollY;
        } else if (flippedPlacement === 'left-end') {
          top = anchorRect.bottom + scrollY - popupRect.height;
        }
      }
    }
  }
  
  // Constrain to viewport
  const finalLeft = Math.max(8, Math.min(left - scrollX, viewportWidth - popupRect.width - 8)) + scrollX;
  const finalTop = Math.max(8, Math.min(top - scrollY, viewportHeight - popupRect.height - 8)) + scrollY;
  
  return {
    top: finalTop,
    left: finalLeft,
    placement: finalPlacement
  };
};

export const Popup: React.FC<PopupProps> = ({
  anchorRef,
  children,
  open,
  onClose,
  placement = "bottom",
  size = "m",
  className = "",
  hasArrow = true,
  autoClose = true,
  closeOnEscape = true,
  offset = 8,
  disablePortal = false,
  zIndex = 1000,
  style,
  animationDuration = 200,
  preventFlip = false,
  id,
}) => {
  const popupRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, placement });
  const [isVisible, setIsVisible] = useState(false);
  const [isPositioned, setIsPositioned] = useState(false);
  const { isDark, isHighContrast, branding } = useTheme();
  // Handle visibility animation
  useEffect(() => {
    if (open) {
      setIsVisible(true);
      setIsPositioned(false);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setIsPositioned(false);
      }, animationDuration);
      return () => clearTimeout(timer);
    }
  }, [open, animationDuration]);

  // Calculate position
  useLayoutEffect(() => {
    if (!open || !isVisible || !anchorRef.current || !popupRef.current) {
      return;
    }

    const updatePosition = () => {
      if (!anchorRef.current || !popupRef.current) return;

      const newPosition = calculatePopupPosition(
        anchorRef.current,
        popupRef.current,
        placement,
        offset,
        preventFlip
      );

      setPosition(newPosition);
      setIsPositioned(true);
    };

    // Initial calculation
    updatePosition();

    // Handle scroll and resize
    const handleUpdate = () => {
      if (open && anchorRef.current && popupRef.current) {
        updatePosition();
      }
    };

    const handleScroll = (event: Event) => {
      // Check if scroll is happening inside a modal
      const target = event.target as HTMLElement;
      const isInsideModal = target?.closest('[role="dialog"]') || target?.closest('.modal') || target?.closest('[data-modal="true"]');

      // Don't close if scrolling inside a modal
      if (isInsideModal) {
        return;
      }

      // Close popup if scrolling outside
      if (onClose) {
        onClose();
      }
    };

    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleUpdate);

    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [open, isVisible, placement, offset, preventFlip, anchorRef]);

  // Handle outside click
  useEffect(() => {
    if (!open || !autoClose || !onClose) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const anchor = anchorRef.current;
      const popup = popupRef.current;

      if (
        anchor &&
        popup &&
        !anchor.contains(target) &&
        !popup.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, autoClose, onClose, anchorRef]);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape || !onClose) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onClose]);

  if (!isVisible) return null;

  const sizeClass = sizeClasses[size];
  const arrowClasses = getArrowClasses(position.placement, hasArrow);

  const popupClassName = [
    "absolute bg-white dark:bg-gray-800",
    "border border-gray-200 dark:border-gray-600",
    "rounded-lg shadow-lg",
    "transition-opacity duration-200 ease-in-out",
    open && isPositioned ? "opacity-100" : "opacity-0",
    sizeClass,
    className
  ].filter(Boolean).join(" ");

  const popupContent = (
    <div
      ref={popupRef}
      id={id}
      className={popupClassName}
      style={{
        position: "absolute",
        top: isPositioned ? position.top : -9999,
        left: isPositioned ? position.left : -9999,
        zIndex,
        transformOrigin: "center",
        backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
        borderColor: isDark ? "#4B5563" : "#E5E7EB",
        color: isDark ? "#F9FAFB" : "#111827",
        maxHeight: "90vh",
        boxShadow: isDark
          ? "0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)"
          : "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        
        ...style
      }}
      role="tooltip"
      aria-hidden={!open}
    >
      {hasArrow && <div className={arrowClasses} />}
      <div className="relative p-4">
        {children}
      </div>
    </div>
  );

  if (disablePortal) {
    return popupContent;
  }

  return ReactDOM.createPortal(popupContent, document.body);
};

// Hook for managing popup state
export const usePopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef<HTMLElement>(null);

  const openPopup = () => setIsOpen(true);
  const closePopup = () => setIsOpen(false);
  const togglePopup = () => setIsOpen(prev => !prev);

  return {
    isOpen,
    anchorRef,
    openPopup,
    closePopup,
    togglePopup
  };
};

export default Popup;