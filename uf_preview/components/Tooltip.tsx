"use client";

import React, { useState, useRef, useEffect } from "react";
import { TooltipPlacement } from "@/types/global";
import { useGlobal } from "@/context/GlobalContext";

interface TooltipProps {
  children: React.ReactNode;
  title: string;
  placement: TooltipPlacement;
  className?: string;
  triggerClassName?: string;
  disable?: boolean;
}

export const Tooltip: React.FC<TooltipProps> = ({
  children,
  title,
  placement,
  className = "",
  triggerClassName = "",
  disable = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const { theme } = useGlobal();

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      let top = 0;
      let left = 0;

      switch (placement) {
        case "top-start":
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left;
          break;
        case "top-end":
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.right - tooltipRect.width;
          break;
        case "bottom-start":
          top = triggerRect.bottom + 8;
          left = triggerRect.left;
          break;
        case "bottom-end":
          top = triggerRect.bottom + 8;
          left = triggerRect.right - tooltipRect.width;
          break;
        case "right-start":
          top = triggerRect.top;
          left = triggerRect.right + 8;
          break;
        case "right-end":
          top = triggerRect.bottom - tooltipRect.height;
          left = triggerRect.right + 8;
          break;
        case "left-start":
          top = triggerRect.top;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case "left-end":
          top = triggerRect.bottom - tooltipRect.height;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
      }

      setPosition({ top, left });
    }

    // Hide tooltip on scroll or any click
    const handleScroll = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };

    const handleAnyClick = () => {
      if (isVisible) {
        setIsVisible(false);
      }
    };

    if (isVisible) {
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('click', handleAnyClick, true);
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('click', handleAnyClick, true);
      };
    }
  }, [isVisible, placement]);

  const getThemeClasses = () => {
    switch (theme) {
      case "dark":
        return "bg-gray-800 text-white border-gray-700";
      case "light-hc":
        return "bg-white text-black border-black";
      case "dark-hc":
        return "bg-black text-white border-white";
      default:
        return "bg-gray-900 text-white border-gray-800";
    }
  };

  if (disable) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(false)}
        className={`w-full h-full ${triggerClassName}`}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`fixed z-50 px-3 py-2 text-sm rounded shadow-lg border ${getThemeClasses()} pointer-events-none ${className}`}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          {title}
        </div>
      )}
    </>
  );
};

 