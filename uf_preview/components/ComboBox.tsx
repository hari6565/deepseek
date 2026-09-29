"use client";

import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useGlobal } from "@/context/GlobalContext";
import { Icon } from "./Icon";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";
import { useInfoMsg } from "@/app/components/infoMsgHandler";

type ContentAlign = "left" | "center" | "right";

interface ComboboxProps {
  value: string | string[];
  onChange: (value: Record<string, string> | string[]) => void;
  toSave: string;
  toDisplay?: string;
  isStatic?: boolean;
  isArray?: boolean;
  isMultiple?: boolean;
  staticOptions?: string[];
  dynamicData?: Record<string, any>[];
  getPaginationData?: (pageCount?: any, page?: number, searchValue?: string, isFromEvent?: boolean, fromWhere?: "onScroll" | "onSearch") => void;
  initialPage?: number;
  pageCount?: number;
  placeholder?: string;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: any;
  headerPosition?: HeaderPosition;
  className?: string;
  disabled?: boolean;
  validationState?: "valid" | "invalid" | "none";
  errorMessage?: string;
  contentAlign?: ContentAlign;
  required?: boolean;
  onBlur?: (e:any) => void;
  search?:string;
  setSearch?:(e:any) => void;
}

export const Combobox: React.FC<ComboboxProps> = ({
  value,
  onChange,
  toSave,
  toDisplay,
  isStatic = false,
  isArray = false,
  isMultiple = false,
  staticOptions = [],
  dynamicData = [],
  getPaginationData,
  initialPage = 1,
  pageCount,
  placeholder = "Select...",
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
  disabled = false,
  validationState = "none",
  errorMessage,
  contentAlign = "center",
  required = false,
  onBlur=(e:any)=>{},
  search="",
  setSearch=(e:any)=>{}
}) => {
  const { theme, branding } = useGlobal();
  const isDark = theme === "dark" || theme === "dark-hc";
  const showToast = useInfoMsg();

  useEffect(() => {
    if (validationState === "invalid" && errorMessage) {
      showToast(errorMessage, "danger");
    }
  }, [validationState, errorMessage]);

  const [isOpen, setIsOpen] = useState(false);
  const [selectedArray, setSelectedArray] = useState<string[]>(Array.isArray(value) ? value : []);
  const [currentPage, setCurrentPage] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [loadTick, setLoadTick] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const highlightedItemRef = useRef<HTMLDivElement | null>(null);
  // Mousedown fires just before focus, so a click sets this flag right
  // before handleTriggerFocus would otherwise run -- lets that handler
  // tell a mouse-driven focus (about to be handled by onClick/handleOpen)
  // apart from a keyboard Tab into the trigger.
  const pointerInteractionRef = useRef(false);

  // Reset highlighted option when the panel closes or the search filters the list
  useEffect(() => {
    if (!isOpen) setHighlightedIndex(-1);
  }, [isOpen]);
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [search]);
  useEffect(() => {
    if (highlightedItemRef.current) {
      highlightedItemRef.current.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex]);

  useEffect(() => {
    if (isArray && Array.isArray(value)) setSelectedArray(value);
  }, [isArray, value]);

  const loadingRef = useRef(false);
  const scrollTopRef = useRef(0);
  const listDivRef = useRef<HTMLDivElement>(null);
  const loadPreLengthRef = useRef<number | undefined>(undefined);
  const noMorePagesRef = useRef(false);

  const dynamicOptions = dynamicData.map((row) => ({
    label: String(row[toDisplay ?? toSave] ?? ""),
    value: String(row[toSave] ?? ""),
  }));
  const staticMapped = staticOptions.map((o) => ({ label: o, value: o }));
  const allOptions = isStatic ? [...staticMapped, ...dynamicOptions] : dynamicOptions;
  const options = search
    ? allOptions.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()))
    : allOptions;

  useEffect(() => {
    if (loadPreLengthRef.current === undefined) return;
    if (dynamicData.length === loadPreLengthRef.current) {
      noMorePagesRef.current = true;
    } else {
      noMorePagesRef.current = false;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadTick]);

  const loadPage = (page: number, searchValue: string = search, fromWhere: "onScroll" | "onSearch" = "onScroll") => {
    if (!page || page < 1 || !pageCount || pageCount < 1) return;
    if (!getPaginationData || loadingRef.current) return;
    const lenBefore = dynamicData.length;
    loadingRef.current = true;
    setIsLoading(true);
    Promise.resolve(getPaginationData(pageCount, page, searchValue, true, fromWhere)).finally(() => {
      loadingRef.current = false;
      setIsLoading(false);
      setCurrentPage(page);
      loadPreLengthRef.current = lenBefore;
      setLoadTick((t) => t + 1);
    });
  };

  // ------------------------------------------------------------------
  // Portal + fixed-position panel (same approach as DateAndTime).
  // The options list is rendered into document.body via createPortal and
  // positioned with position:fixed, computed from the trigger's
  // getBoundingClientRect(). This means we no longer need to walk up the
  // DOM tree and force ancestor overflow to "visible" -- the panel can
  // never be clipped by an ancestor's overflow:hidden/auto because it's
  // not a DOM descendant of any of them anymore.
  // ------------------------------------------------------------------

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const triggerRef = useRef<HTMLDivElement>(null); // outer wrapper (kept for CommonHeaderAndTooltip sizing + click outside)
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  // Focus the search input manually (instead of the native `autoFocus`
  // attribute) with preventScroll: true. autoFocus fires while the portaled
  // panel is still unpositioned (before the layout effect below gives it
  // `position: fixed` near the trigger), so the browser's default
  // scroll-into-view would jump the whole page down to reach it.
  useEffect(() => {
    if (isOpen) searchInputRef.current?.focus({ preventScroll: true });
  }, [isOpen]);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const GAP = 4;
    const VIEWPORT_MARGIN = 8;
    const ESTIMATED_HEIGHT = 260; // search bar + max-h-60 list, before real measurement

    const recalcPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;

      const panelRect = panelRef.current?.getBoundingClientRect();
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

    recalcPosition();
    const raf = requestAnimationFrame(recalcPosition);

    window.addEventListener("resize", recalcPosition);
    window.addEventListener("scroll", recalcPosition, true);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalcPosition);
      window.removeEventListener("scroll", recalcPosition, true);
    };
  }, [isOpen, options.length, isLoading]);

  const openPanel = () => {
    setIsOpen(true);
    noMorePagesRef.current = false;
    if (!isStatic && !currentPage && !loadingRef.current) {
      loadPage(initialPage);
    }
  };

  const handleOpen = () => {
    pointerInteractionRef.current = false;
    if (disabled) return;
    if (isOpen) {
      setIsOpen(false);
    } else {
      openPanel();
    }
  };

  const handleTriggerFocus = () => {
    if (pointerInteractionRef.current || disabled || isOpen) return;
    openPanel();
  };

  const handleListScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (isStatic) return;
    const el = e.currentTarget;
    const isScrollingDown = el.scrollTop > scrollTopRef.current;
    scrollTopRef.current = el.scrollTop;
    if (
      isScrollingDown &&
      el.scrollHeight - el.scrollTop <= el.clientHeight + 20 &&
      !loadingRef.current &&
      !noMorePagesRef.current
    ) {
      loadPage((currentPage || 1) + 1);
    }
  };

  const handleListWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (isStatic) return;
    const el = e.currentTarget;
    if (
      e.deltaY > 0 &&
      !loadingRef.current &&
      !noMorePagesRef.current &&
      el.scrollHeight > el.clientHeight &&
      el.scrollHeight - el.scrollTop <= el.clientHeight + 20
    ) {
      loadPage((currentPage || 1) + 1);
    }
  };

  const handleSelect = (option: { label: string; value: string }) => {
    if (isArray) {
      if (isMultiple) {
        const next = selectedArray.includes(option.value)
          ? selectedArray.filter((v) => v !== option.value)
          : [...selectedArray, option.value];
        setSelectedArray(next);
        onChange(next);
        onBlur?.(next);
      } else {
        const next = [option.value];
        setSelectedArray(next);
        onChange(next);
        setIsOpen(false);
        buttonRef.current?.focus();
        onBlur?.(next);
      }
    } else {
      const next = { [toSave]: option.value, ...(toDisplay ? { [toDisplay]: option.label } : {}) };
      onChange(next);
      setIsOpen(false);
      buttonRef.current?.focus();
      onBlur?.(next);
    }
  };

  // Focus stays on the search input (inside the portaled panel) while
  // open, so Tab/Escape explicitly return focus to the trigger button
  // before letting the browser's default action run -- without this, the
  // browser computes "next focusable" from inside the portal, which is
  // appended at the very end of document.body and has nothing after it,
  // so Tab jumps straight out of the page (into browser chrome) instead
  // of moving to the next control in the form.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        openPanel();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < options.length - 1 ? prev + 1 : prev));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < options.length) {
          handleSelect(options[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
      case "Tab":
        setIsOpen(false);
        buttonRef.current?.focus();
        break;
    }
  };

  const getBorderColor = () => {
    if (validationState === "invalid") return "border-red-500";
    if (validationState === "valid") return "border-green-500";
    if (isOpen) return "";
    return isDark ? "border-gray-600" : "border-gray-300";
  };

  const getContentAlignClass = () => {
    switch (contentAlign) {
      case "left": return "justify-start";
      case "right": return "justify-end";
      default: return "justify-center";
    }
  };

  const getTextAlignClass = () => {
    switch (contentAlign) {
      case "left": return "text-left";
      case "right": return "text-right";
      default: return "text-center";
    }
  };

  // Click-outside now needs to check BOTH the trigger wrapper and the
  // portaled panel, since the panel is no longer a DOM descendant of
  // triggerRef once it's rendered into document.body.
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = triggerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
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

  const comboboxElement = (
    <div
      ref={triggerRef}
      className={`relative flex ${getContentAlignClass()} w-full h-full ${className}`}
      tabIndex={-1}
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        onMouseDown={() => { pointerInteractionRef.current = true; }}
        onFocus={handleTriggerFocus}
        disabled={disabled}
        className={`
          w-full px-4 py-2 border-2 flex items-center justify-between
          ${getBorderColor()}
          ${isDark ? "bg-gray-800 text-white" : "bg-white text-black"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          transition-colors focus:outline-none
        `}
        style={{
          borderRadius: "var(--border-radius)",
          borderColor: validationState === "none" && isOpen ? branding.selectionColor : undefined,
        }}
        onMouseEnter={(e) => {
          if (!disabled && validationState === "none" && !isOpen)
            e.currentTarget.style.borderColor = branding.hoverColor;
        }}
        onMouseLeave={(e) => {
          if (!disabled && validationState === "none" && !isOpen)
            e.currentTarget.style.borderColor = "";
        }}
      >
        <span className={`w-4/5 truncate ${getTextAlignClass()} ${(isArray ? selectedArray.length === 0 : !value) ? (isDark ? "text-gray-500" : "text-gray-400") : ""}`}>
          {isArray
            ? selectedArray.length > 0 ? `${selectedArray.length} selected` : placeholder
            : (value as string) || placeholder}
        </span>
        <div className="flex items-center gap-1">
          {(isArray ? selectedArray.length > 0 : !!value) && !disabled && (
            <span
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (isArray) {
                  setSelectedArray([]);
                  onChange([]);
                } else {
                  onChange({ [toSave]: "", ...(toDisplay ? { [toDisplay]: "" } : {}) });
                }
                onBlur?.("")
              }}
              className={`p-0.5 rounded transition-colors cursor-pointer ${isDark ? "hover:bg-gray-600" : "hover:bg-gray-200"}`}
              style={{ borderRadius: "var(--border-radius)" }}
            >
              <Icon data="IoIosClose" fillContainer={false} />
            </span>
          )}
          <Icon data={isOpen ? "IoIosArrowUp" : "IoIosArrowDown"} fillContainer={false} />
        </div>
      </button>

      {mounted && isOpen && createPortal(
        <div
          ref={panelRef}
          className={`overflow-y-auto border-2 shadow-lg ${isDark ? "bg-gray-800 border-gray-600" : "bg-white border-gray-300"}`}
          style={panelStyle}
          onMouseDown={(e) => e.stopPropagation()}
          onScroll={handleListScroll}
          onWheel={handleListWheel}
        >
          <div className="px-2 pt-2 pb-1 sticky top-0" style={{ background: isDark ? "#1f2937" : "#fff" }}>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => {
                const val = e.target.value;
                setSearch(val);
                if (!isStatic) {
                  noMorePagesRef.current = false;
                  setCurrentPage(undefined);
                  loadPage(1, val, "onSearch");
                }
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onKeyDown={handleKeyDown}
              placeholder="Search..."
              className={`w-full px-3 py-1 border focus:outline-none  ${isDark ? "bg-gray-700 text-white border-gray-500 placeholder-gray-400" : "bg-white text-black border-gray-300 placeholder-gray-400"}`}
              style={{ borderRadius: "var(--border-radius)" }}
            />
          </div>
          {options.map((option, idx) => {
            const isSelected = isArray ? selectedArray.includes(option.value) : option.label === value || option.value === value;
            const isHighlighted = idx === highlightedIndex;
            return (
              <div
                key={`${option.value}-${idx}`}
                ref={isHighlighted ? highlightedItemRef : null}
                className={`px-4 py-2 cursor-pointer transition-colors  ${
                  isSelected
                    ? "text-white"
                    : isDark ? "text-gray-200 hover:[background-color:var(--hover-color)]" : "text-gray-700 hover:[background-color:var(--hover-color)]"
                }`}
                style={{
                  backgroundColor: isSelected
                    ? branding.selectionColor
                    : isHighlighted
                    ? branding.hoverColor
                    : undefined,
                }}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(option)}
              >
                {option.label}
              </div>
            );
          })}
          {isLoading && (
            <div className={`px-4 py-2 text-center ${isDark ? "text-gray-400" : "text-gray-500"}`}>
              Loading...
            </div>
          )}
        </div>,
        document.body
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
      fillContainer={true}
      required={required}
    >
      {comboboxElement}
    </CommonHeaderAndTooltip>
  );
};