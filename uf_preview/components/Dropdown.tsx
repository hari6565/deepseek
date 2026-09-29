"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { Icon } from "./Icon";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";
import { useInfoMsg } from "@/app/components/infoMsgHandler";

type ContentAlign = "left" | "center" | "right";

interface DropdownProps {
  static?: boolean;
  dynamic?: boolean;
  multiselect?: boolean;
  multiple?: boolean;
  isArray?: boolean;
  staticProps?: string[];
  dynamicProps?: string;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: any
  headerPosition?: HeaderPosition;
  onChange?: (selected: string | string[]) => void;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
  filterable?: boolean;
  hasClear?: boolean;
  value?: string | string[];
  validationState?: "valid" | "invalid" | "none";
  errorMessage?: string;
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

export const Dropdown: React.FC<DropdownProps> = ({
  static: isStatic = false,
  dynamic = false,
  multiselect = false,
  multiple = false,
  isArray = false,
  staticProps = [],
  dynamicProps,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  onChange,
  className = "",
  disabled = false,
  placeholder = "Select...",
  filterable = false,
  hasClear = false,
  value,
  validationState = undefined,
  errorMessage,
  fillContainer = true,
  contentAlign = "center",
  onLoadMore,
  isLoadingMore = false,
}) => {
  const isMultiple = multiselect || multiple;
  const { theme, direction,branding } = useGlobal();
  const showToast = useInfoMsg();

  useEffect(() => {
    if (validationState === "invalid" && errorMessage) {
      showToast(errorMessage, "danger");
    }
  }, [validationState, errorMessage]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const dropdownRef = useRef<HTMLDivElement>(null); // trigger wrapper (input/button)
  const listRef = useRef<HTMLDivElement>(null); // portaled options panel
  const highlightedItemRef = useRef<HTMLDivElement | null>(null);

  // Reset highlighted index when dropdown closes
  useEffect(() => {
    if (!isOpen) setHighlightedIndex(-1);
  }, [isOpen]);

  // Reset highlighted index when filter text changes
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filterText]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedItemRef.current) {
      highlightedItemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  // ------------------------------------------------------------------
  // Portal + fixed-position panel (same approach as DateAndTime/Combobox).
  // The options list is rendered into document.body via createPortal and
  // positioned with position:fixed, computed from the trigger's
  // getBoundingClientRect(). This replaces the old approach of walking up
  // the DOM tree and forcing every ancestor's overflow to "visible" --
  // the panel can no longer be clipped by an ancestor's overflow:hidden
  // /auto because it isn't a DOM descendant of any of them anymore.
  // ------------------------------------------------------------------

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  useLayoutEffect(() => {
    if (!isOpen) return;

    const GAP = 4;
    const VIEWPORT_MARGIN = 8;
    const ESTIMATED_HEIGHT = 260; // ~search bar (if any) + max-h-60 list, before real measurement

    const recalcPosition = () => {
      const trigger = dropdownRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const panelRect = listRef.current?.getBoundingClientRect();
      const panelHeight = panelRect?.height || ESTIMATED_HEIGHT;
      const panelWidth = triggerRect.width;

      const spaceBelow = viewportHeight - triggerRect.bottom - GAP;
      const spaceAbove = triggerRect.top - GAP;
      const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;

      const availableVertical = Math.max(
        120,
        (openUpward ? spaceAbove : spaceBelow) - VIEWPORT_MARGIN
      );

      const style: React.CSSProperties = {
        position: "fixed",
        left: triggerRect.left,
        width: panelWidth,
        zIndex: 9999,
      };

      if (openUpward) {
        style.bottom = viewportHeight - triggerRect.top + GAP;
      } else {
        style.top = triggerRect.bottom + GAP;
      }

      if (panelHeight > availableVertical) {
        style.maxHeight = availableVertical;
      }

      setPanelStyle(style);
    };

    // Scrolling inside the options panel itself doesn't move the trigger,
    // so it shouldn't trigger a reposition -- and letting it through here
    // means the panel's own scroll gets treated like an ancestor scroll by
    // anything else listening on window (e.g. overlay/close-on-scroll logic
    // in whatever the dropdown is rendered inside).
    const handleWindowScroll = (e: Event) => {
      if (listRef.current && listRef.current.contains(e.target as Node)) return;
      recalcPosition();
    };

    recalcPosition();
    const raf = requestAnimationFrame(recalcPosition);

    window.addEventListener("resize", recalcPosition);
    window.addEventListener("scroll", handleWindowScroll, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalcPosition);
      window.removeEventListener("scroll", handleWindowScroll, true);
    };
  }, [isOpen, filterText, isLoadingMore]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        e.preventDefault();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        // Don't preventDefault -- let focus move to the next/previous
        // control as normal, just close the panel so it doesn't stay
        // floating open over whatever the user tabs into.
        setIsOpen(false);
        break;
    }
  };

  // Infinite scroll: fire onLoadMore only when scrolling DOWN and reaching the bottom
  useEffect(() => {
    const el = listRef.current;
    if (!el || !onLoadMore) return;
    let prevScrollTop = el.scrollTop;
    const handleScroll = () => {
      const isScrollingDown = el.scrollTop > prevScrollTop;
      prevScrollTop = el.scrollTop;
      if (isScrollingDown && el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
        onLoadMore();
      }
    };
    el.addEventListener('scroll', handleScroll);
    return () => el.removeEventListener('scroll', handleScroll);
  }, [isOpen, onLoadMore]);

  // Sync internal state with external value prop
  useEffect(() => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        setSelectedValues(value);
      } else {
        setSelectedValues(value ? [value] : []);
      }
    }
  }, [value]);

  // Close dropdown when clicking outside.
  // Checks both the trigger wrapper AND the portaled panel, since the
  // panel is no longer a DOM descendant of dropdownRef once portaled.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = dropdownRef.current?.contains(target);
      const insidePanel = listRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const options = isStatic ? staticProps : dynamic ? [] : staticProps;

  const filteredOptions = filterable
    ? options.filter(option =>
        option.toLowerCase().includes(filterText.toLowerCase())
      )
    : options;

  const handleSelect = (value: string) => {
    if (isMultiple) {
      const newValues = selectedValues.includes(value)
        ? selectedValues.filter(v => v !== value)
        : [...selectedValues, value];
      setSelectedValues(newValues);
      onChange?.(newValues);
    } else {
      setSelectedValues([value]);
      onChange?.(value);
      setIsOpen(false);
      setFilterText("");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValues([]);
    setFilterText("");
    onChange?.(isMultiple ? [] : "");
  };

  const tooltipTitle = isMultiple
    ? selectedValues.join(', ')
    : (selectedValues[0] || '');
  const showTooltip = disabled && tooltipTitle.trim() !== '';

  const isDark = theme === "dark" || theme === "dark-hc";

  const getBorderColor = () => {
    if (validationState === "invalid") return "border-red-500";
    if (validationState === "valid") return "border-green-500";
    if (isOpen) return "";
    return isDark ? "border-gray-600" : "border-gray-300";
  };

  // No fixed validation color (invalid/valid) is driving the border,
  // so hover/open highlighting is free to apply.
  const isNeutralValidation = validationState !== "invalid" && validationState !== "valid";

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

  const optionsPanel = (
    <div
      ref={listRef}
      data-modal="true"
      className={`
        border-2
        ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"}
        shadow-lg
        overflow-auto
      `}
      style={{ borderRadius: "var(--border-radius)", maxHeight: panelStyle.maxHeight ?? 240, overscrollBehavior: "contain", ...panelStyle }}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {filteredOptions.map((option, index) => {
        const isSelected = selectedValues.includes(option);
        const isHighlighted = index === highlightedIndex;
        return (
          <div
            key={index}
            ref={isHighlighted ? highlightedItemRef : null}
            onClick={() => handleSelect(option)}
            onMouseEnter={() => setHighlightedIndex(index)}
            onMouseLeave={() => setHighlightedIndex(-1)}
            className={`
              px-4 py-2
              cursor-pointer
              flex items-center justify-between
              transition-colors
              ${isSelected
                ? `text-white`
                : isDark ? "text-gray-200" : "text-gray-700"
              }
              ${className}
            `}
            style={{
              backgroundColor: isSelected
                ? branding.selectionColor
                : isHighlighted
                ? branding.hoverColor
                : undefined,
            }}
          >
            <span>{option}</span>
            {isMultiple && isSelected && <Icon fillContainer={false} data="FaCheck" />}
          </div>
        );
      })}
      {isLoadingMore && (
        <div className={`px-4 py-2 text-center text-sm ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          Loading...
        </div>
      )}
    </div>
  );

  const dropdownElement = (
    <div 
      ref={dropdownRef} 
      className={`relative 
      ${getContentAlignClasses()}
      ${getFillClasses()}
      ${className}
       `} 
    >
      {filterable ? (
        <Tooltip
          title={tooltipTitle}
          placement="bottom-start"
          disable={!showTooltip}
        >
        <div className="relative w-full h-full">
          <input
            type="text"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder={selectedValues.length > 0
              ? isMultiple
                ? `${selectedValues.length} selected`
                : selectedValues[0]
              : placeholder
            }
            disabled={disabled}
            className={`
              w-full
              h-full
              px-4 py-2
              ${hasClear && selectedValues.length > 0 ? "pr-16" : "pr-10"}
              border-2
              ${getBorderColor()}
              ${isDark ? "bg-gray-800 text-white placeholder-white" : "bg-white text-black placeholder-black"}
              ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
              transition-colors
              focus:outline-none
              ${className}
            `}
            style={{
              borderRadius: "var(--border-radius)",
              borderColor: isNeutralValidation && isOpen ? branding.selectionColor : undefined,
            }}
            onMouseEnter={e => {
              if (!disabled && isNeutralValidation && !isOpen) {
                e.currentTarget.style.borderColor = branding.hoverColor
              }
            }}
            onMouseLeave={e => {
              if (!disabled && isNeutralValidation && !isOpen) {
                e.currentTarget.style.borderColor = ''
              }
            }}
            onFocus={() => {
              if (!disabled) {
                setIsOpen(true)
              }
            }}
            onKeyDown={handleKeyDown}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {hasClear && selectedValues.length > 0 && !disabled && (
              <button
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                style={{ borderRadius: "var(--border-radius)" }}
                type="button"
              >
                <Icon data="IoIosClose" fillContainer={false} />
              </button>
            )}
            <button
              onClick={() => !disabled && setIsOpen(!isOpen)}
              className="p-1 cursor-pointer"
              type="button"
              disabled={disabled}
            >
              <Icon data={isOpen ? "IoIosArrowUp" : "IoIosArrowDown"} fillContainer={false} />
            </button>
          </div>
        </div>
        </Tooltip>
      ) : (
        <Tooltip
          title={tooltipTitle}
          placement="bottom-start"
          disable={!showTooltip}
        >
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full
            px-4 py-2
            border-2
            ${getBorderColor()}
            flex items-center justify-between
            ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}
            ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"}
            transition-colors
            ${className}
          `}
          style={{
            borderRadius: "var(--border-radius)",
            borderColor: isNeutralValidation && isOpen ? branding.selectionColor : undefined,
          }}
          onMouseEnter={e => {
            if (!disabled && isNeutralValidation && !isOpen) {
              e.currentTarget.style.borderColor = branding.hoverColor
            }
          }}
          onMouseLeave={e => {
            if (!disabled && isNeutralValidation && !isOpen) {
              e.currentTarget.style.borderColor = ''
            }
          }}
          onKeyDown={handleKeyDown}
        >
          <span className="w-4/5 truncate">
            {selectedValues.length > 0
              ? isMultiple
                ? `${selectedValues.length} selected`
                : selectedValues[0]
              : placeholder}
          </span>
          <div className="flex items-center gap-2">
            {hasClear && selectedValues.length > 0 && !disabled && (
              <div
                onClick={handleClear}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                style={{ borderRadius: "var(--border-radius)" }}
              >
                <Icon data="IoIosClose" fillContainer={false} />
              </div>
            )}
            <Icon data={isOpen ? "IoIosArrowUp" : "IoIosArrowDown"} fillContainer={false} />
          </div>
        </button>
        </Tooltip>
      )}

      {mounted && isOpen && createPortal(optionsPanel, document.body)}
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
      {dropdownElement}
    </CommonHeaderAndTooltip>
  )
};