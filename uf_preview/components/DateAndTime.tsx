"use client";

import React, { useState, useRef, useEffect, useLayoutEffect, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";
import { useInfoMsg } from "@/app/components/infoMsgHandler";
import { FiCalendar, FiX, FiEdit2, FiChevronLeft, FiChevronRight, FiChevronDown } from "react-icons/fi";
import dayjs from "dayjs";

type ContentAlign = "left" | "center" | "right";

interface DatePickerProps {
  readOnly?: boolean;
  disabled?: boolean;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  value?: string | Date | null;
  onChange?: (date: string) => void;
  onUpdate?: (date: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  className?: string;
  label?: string;
  style?: React.CSSProperties;
  validationState?: "invalid" | undefined;
  errorMessage?: string;
  fillContainer?: boolean;
  contentAlign?: ContentAlign;
  required?: boolean;
  showTime?: boolean;
  dateValidation?: "Future" | "FutureOrPresent" | "PastOrPresent" | "Past";
}

/* ---------------------------------- helpers ---------------------------------- */

// Sunday-first, matching the target design (Su Mo Tu We Th Fr Sa)
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const pad = (n: number) => n.toString().padStart(2, "0");

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function sundayIndex(date: Date) {
  return date.getDay();
}

function buildCalendarGrid(year: number, month: number) {
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = sundayIndex(firstOfMonth);
  const totalDays = daysInMonth(year, month);
  const prevMonthDays = daysInMonth(year, month - 1);

  const cells: { day: number; currentMonth: boolean; date: Date }[] = [];

  for (let i = startOffset - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    cells.push({ day, currentMonth: false, date: new Date(year, month - 1, day) });
  }
  for (let day = 1; day <= totalDays; day++) {
    cells.push({ day, currentMonth: true, date: new Date(year, month, day) });
  }
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ day: nextDay, currentMonth: false, date: new Date(year, month + 1, nextDay) });
    nextDay++;
  }
  return cells;
}

function isSameDay(a: Date | null, b: Date | null) {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function getAlignClass(align: ContentAlign) {
  switch (align) {
    case "left":
      return "items-start";
    case "right":
      return "items-end";
    case "center":
    default:
      return "items-center";
  }
}

/* --------------------------------- wheel column -------------------------------- */

const ITEM_HEIGHT = 32;

interface WheelColumnProps {
  values: (number | string)[];
  initialSelected: number | string;
  isDark: boolean;
  width?: number;
}

export interface WheelColumnHandle {
  getCurrentValue: () => number | string;
}

const formatWheelValue = (v: number | string) => (typeof v === "number" ? pad(v) : v);

const WheelColumn = forwardRef<WheelColumnHandle, WheelColumnProps>(
  ({ values, initialSelected, isDark, width = 40 }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const scrollTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [centeredValue, setCenteredValue] = useState<number | string>(initialSelected);

    const readCenteredValue = (): number | string => {
      const el = containerRef.current;
      if (!el) return centeredValue;
      const index = Math.round(el.scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(values.length - 1, index));
      return values[clamped];
    };

    useEffect(() => {
      const index = values.findIndex((v) => v === initialSelected);
      if (containerRef.current && index >= 0) {
        containerRef.current.scrollTop = index * ITEM_HEIGHT;
      }
      setCenteredValue(initialSelected);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSelected]);

    const handleScroll = () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setCenteredValue(readCenteredValue());
      }, 60);
    };

    useImperativeHandle(ref, () => ({
      getCurrentValue: () => centeredValue,
    }));

    return (
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="overflow-y-scroll"
        style={{ height: ITEM_HEIGHT * 3, width, scrollSnapType: "y mandatory", scrollbarWidth: "none" }}
      >
        <div style={{ height: ITEM_HEIGHT }} />
        {values.map((v, i) => (
          <div
            key={i}
            className={`flex items-center justify-center select-none ${
              v === centeredValue
                ? isDark
                  ? "text-white font-semibold text-base"
                  : "text-gray-900 font-semibold text-base"
                : isDark
                ? "text-gray-500 text-sm"
                : "text-gray-400 text-sm"
            }`}
            style={{ height: ITEM_HEIGHT, scrollSnapAlign: "center" }}
          >
            {formatWheelValue(v)}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT }} />
      </div>
    );
  }
);
WheelColumn.displayName = "WheelColumn";

/* --------------------------------- main component -------------------------------- */

export const DateAndTime: React.FC<DatePickerProps> = ({
  readOnly = false,
  disabled = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  value = "",
  onChange,
  onUpdate,
  onBlur,
  className = "",
  label,
  style,
  validationState,
  errorMessage,
  fillContainer = true,
  contentAlign = "center",
  required = false,
  showTime = true,
  dateValidation,
}) => {
  const { theme, branding, displayFormat } = useGlobal();
  const showToast = useInfoMsg();
  const prevValidationState = useRef(validationState);
  const containerRef = useRef<HTMLDivElement>(null);

  // Refs used for smart (flip-aware) positioning of the dropdown panel.
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // The panel is rendered through a portal (see below), so we need to wait
  // for the client to mount before we can reach `document.body`.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Computed inline (fixed) position for the panel, derived from
  // getBoundingClientRect() on the trigger + panel. Using position:fixed +
  // a portal means the panel is never clipped by an ancestor's
  // overflow:hidden/auto, which is what caused the scrollbar/clipping seen
  // when <DateAndTime /> sits inside a constrained wrapper <div>.
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties>({});

  const dateFormat = displayFormat?.datePickerProperty?.dateDisplayFormat || "DD-MM-YYYY";
  const timeFormat = displayFormat?.timePickerProperty?.timeDisplayFormat || "HH:mm:ss";

  const panelColor = branding.brandColor || "#2F3EC7";

  React.useEffect(() => {
    if (validationState === "invalid" && errorMessage && prevValidationState.current !== "invalid") {
      showToast(errorMessage, "danger");
    }
    prevValidationState.current = validationState;
  }, [validationState, errorMessage]);

  const isDark = theme === "dark" || theme === "dark-hc";

  const parseValue = (val: string | Date | null): Date | null => {
    if (!val) return null;
    if (val instanceof Date) return isNaN(val.getTime()) ? null : val;

    const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(val.trim());
    if (dateOnlyMatch) {
      const [, y, mo, d] = dateOnlyMatch;
      const local = new Date(Number(y), Number(mo) - 1, Number(d));
      return isNaN(local.getTime()) ? null : local;
    }

    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  };

  const initial = parseValue(value);

  const [selectedDate, setSelectedDate] = useState<Date | null>(initial);
  const [hour12, setHour12] = useState<number>(initial ? (initial.getHours() % 12 || 12) : 12);
  const [minute, setMinute] = useState<number>(initial ? initial.getMinutes() : 0);
  const [second, setSecond] = useState<number>(initial ? initial.getSeconds() : 0);
  const [ampm, setAmpm] = useState<"AM" | "PM">(initial && initial.getHours() >= 12 ? "PM" : "AM");
  const [viewMonth, setViewMonth] = useState<Date>(initial ?? new Date());
  const [step, setStep] = useState<"closed" | "date" | "time">("closed");

  useEffect(() => {
    const v = parseValue(value);
    setSelectedDate(v);
    if (v) {
      setHour12(v.getHours() % 12 || 12);
      setMinute(v.getMinutes());
      setSecond(v.getSeconds());
      setAmpm(v.getHours() >= 12 ? "PM" : "AM");
      setViewMonth(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      // Because the panel is portaled to document.body, it's no longer a
      // DOM descendant of containerRef — it must be checked separately or
      // every click inside it (e.g. picking a day) would immediately close it.
      const insideTrigger = containerRef.current?.contains(target);
      const insidePanel = panelRef.current?.contains(target);
      if (!insideTrigger && !insidePanel) {
        setStep("closed");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ----------------------- smart panel positioning ----------------------- */
  // Uses getBoundingClientRect() on both the trigger element and the panel
  // itself to compute a position:fixed style (top/bottom/left/right in
  // viewport coordinates). Combined with the portal below, this is what
  // lets the panel escape a wrapper <div> that clips or scrolls it —
  // position:fixed is measured against the viewport, not the nearest
  // scrollable/overflow ancestor, so wrapping markup like
  // `<div><DateAndTime /></div>` can no longer cause the panel to be
  // clipped or to force that wrapper to scroll.
  useLayoutEffect(() => {
    if (step === "closed") {
      return;
    }

    const GAP = 4; // px gap between trigger and panel
    const VIEWPORT_MARGIN = 8; // keep a small breathing margin from the edges

    const recalcPosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;

      const triggerRect = trigger.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      // Fall back to sensible estimates before the panel has painted,
      // then refine using the panel's real rect once it's mounted.
      const panelRect = panelRef.current?.getBoundingClientRect();
      const estimatedHeight = step === "date" ? 340 : 220;
      const panelHeight = panelRect?.height || estimatedHeight;
      const panelWidth = triggerRect.width;

      const spaceBelow = viewportHeight - triggerRect.bottom - GAP;
      const spaceAbove = triggerRect.top - GAP;
      const openUpward = spaceBelow < panelHeight && spaceAbove > spaceBelow;

      const spaceRight = viewportWidth - triggerRect.left;
      const openLeftward = spaceRight < panelWidth && triggerRect.right > panelWidth;

      const availableVertical = Math.max(
        120,
        (openUpward ? spaceAbove : spaceBelow) - VIEWPORT_MARGIN
      );

      const style: React.CSSProperties = {
        position: "fixed",
        width: panelWidth,
        zIndex: 9999,
        backgroundColor: panelColor,
      };

      if (openLeftward) {
        style.right = viewportWidth - triggerRect.right;
      } else {
        style.left = triggerRect.left;
      }

      if (openUpward) {
        style.bottom = viewportHeight - triggerRect.top + GAP;
      } else {
        style.top = triggerRect.bottom + GAP;
      }

      if (panelHeight > availableVertical) {
        style.maxHeight = availableVertical;
        style.overflowY = "auto";
      }

      setPanelStyle(style);
    };

    // Measure once synchronously (pre-paint estimate), then again after the
    // panel has actually rendered so we can use its real bounding rect.
    recalcPosition();
    const raf = requestAnimationFrame(recalcPosition);

    window.addEventListener("resize", recalcPosition);
    window.addEventListener("scroll", recalcPosition, true); // capture: catches scrollable ancestors too

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", recalcPosition);
      window.removeEventListener("scroll", recalcPosition, true);
    };
  }, [step, panelColor]);

  const buildJsDate = (date: Date, h12: number, m: number, s: number, ap: "AM" | "PM") => {
    let h24 = h12 % 12;
    if (ap === "PM") h24 += 12;
    const d = new Date(date);
    d.setHours(h24, m, s, 0);
    return d;
  };

  const buildCombined = (date: Date | null, h12: number, m: number, s: number, ap: "AM" | "PM") => {
    if (!date) return "";
    if (!showTime) return dayjs(date).format("YYYY-MM-DD");
    return dayjs(buildJsDate(date, h12, m, s, ap)).format("YYYY-MM-DDTHH:mm:ssZ");
  };

  const emit = (date: Date | null, h12: number, m: number, s: number, ap: "AM" | "PM") => {
    const combined = buildCombined(date, h12, m, s, ap);
    onChange?.(combined);
    onUpdate?.(combined);
  };

  /* ----------------------------- date validation ----------------------------- */

  const getMinDate = (): Date | null => {
    if (dateValidation === "Future") {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (dateValidation === "FutureOrPresent") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return null;
  };

  const getMaxDate = (): Date | null => {
    if (dateValidation === "Past") {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    if (dateValidation === "PastOrPresent") {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    }
    return null;
  };

  const isDateDisabled = (date: Date): boolean => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const min = getMinDate();
    const max = getMaxDate();
    if (min && d < min) return true;
    if (max && d > max) return true;
    return false;
  };

  const handleDayClick = (date: Date) => {
    if (isDateDisabled(date)) return;
    setSelectedDate(date);
    emit(date, hour12, minute, second, ampm);
    setStep(showTime ? "time" : "closed");
  };

  const hourWheelRef = useRef<WheelColumnHandle>(null);
  const minuteWheelRef = useRef<WheelColumnHandle>(null);
  const secondWheelRef = useRef<WheelColumnHandle>(null);
  const ampmWheelRef = useRef<WheelColumnHandle>(null);

  const commitTimeSelection = () => {
    const h = (hourWheelRef.current?.getCurrentValue() as number) ?? hour12;
    const m = (minuteWheelRef.current?.getCurrentValue() as number) ?? minute;
    const s = (secondWheelRef.current?.getCurrentValue() as number) ?? second;
    const a = (ampmWheelRef.current?.getCurrentValue() as "AM" | "PM") ?? ampm;
    setHour12(h);
    setMinute(m);
    setSecond(s);
    setAmpm(a);
    emit(selectedDate, h, m, s, a);
    setStep("closed");
    onBlur?.({} as React.FocusEvent<HTMLInputElement>);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(null);
    setStep("closed");
    onChange?.("");
    onUpdate?.("");
  };

  const toggleOpen = () => {
    if (disabled || readOnly) return;
    setStep((prev) => (prev === "closed" ? "date" : "closed"));
  };

  const getTextAlignClass = () => {
    switch (contentAlign) {
      case "left":
        return "text-left";
      case "right":
        return "text-right";
      default:
        return "text-center";
    }
  };

  const displayText = () => {
    if (!selectedDate) return "";
    const dateStr = dayjs(selectedDate).format(dateFormat);
    if (!showTime) return dateStr;
    const timeStr = dayjs(buildJsDate(selectedDate, hour12, minute, second, ampm)).format(timeFormat);
    return `${dateStr} ${timeStr}`;
  };

  const grid = buildCalendarGrid(viewMonth.getFullYear(), viewMonth.getMonth());
  const today = new Date();

  const hourValues = Array.from({ length: 12 }, (_, i) => i + 1);
  const minuteValues = Array.from({ length: 60 }, (_, i) => i);
  const secondValues = Array.from({ length: 60 }, (_, i) => i);

  const borderColorClass =
    validationState === "invalid" ? "border-red-500" : isDark ? "border-gray-600" : "border-gray-300";

  const datePickerElement = (
    <div
      ref={containerRef}
      className={`relative flex flex-col ${getAlignClass(contentAlign)} ${fillContainer ? "w-full h-full" : ""}`}
      style={style}
    >
      {label && (
        <label className={`block mb-2 font-medium ${isDark ? "text-gray-200" : "text-gray-700"}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        ref={triggerRef}
        onClick={toggleOpen}
        className={`flex flex-1 min-h-0 flex items-center
          border-2 px-2 sm:px-3 transition-colors ${borderColorClass} ${
          isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"} ${
          fillContainer ? "w-full" : ""
        } ${className}`}
        style={{ borderRadius: "var(--border-radius, 6px)" }}
      >
        <span className={`flex-1 text-sm truncate ${getTextAlignClass()} ${!selectedDate ? (isDark ? "text-gray-500" : "text-gray-400") : ""}`}>
          {selectedDate ? displayText() : "Select Date"}
        </span>
        {selectedDate && !disabled && !readOnly && (
          <FiX size={16} className="opacity-60 hover:opacity-100 shrink-0" onClick={handleClear} />
        )}
        {!disabled && !readOnly && value && (
          <FiEdit2
            size={14}
            className="opacity-60 hover:opacity-100 shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleOpen();
            }}
          />
        )}
        {!selectedDate && <FiCalendar size={16} className="opacity-60 shrink-0" />}
      </div>

      {mounted && step !== "closed" && createPortal(
        <div
          ref={panelRef}
          className="rounded-lg shadow-lg p-4"
          style={panelStyle}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          {step === "date" && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-white font-bold text-base">Select Date</span>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-white text-sm underline underline-offset-2 opacity-90 hover:opacity-100"
                >
                  Clear
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                  className="text-white opacity-90 hover:opacity-100"
                >
                  <FiChevronLeft size={18} />
                </button>
                <span className="flex items-center gap-1 text-sm font-semibold text-white">
                  {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
                </span>
                <button
                  type="button"
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                  className="text-white opacity-90 hover:opacity-100"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>

              <div className="grid grid-cols-7 text-xs mb-1">
                {WEEKDAYS.map((wd) => (
                  <div key={wd} className="text-center py-1 font-medium text-white opacity-80">
                    {wd}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-y-1 text-sm">
                {grid.map((cell, i) => {
                  const selected = isSameDay(cell.date, selectedDate);
                  const isToday = isSameDay(cell.date, today);
                  const disabledDay = isDateDisabled(cell.date);
                  return (
                    <button
                      type="button"
                      key={i}
                      disabled={disabledDay}
                      onClick={() => handleDayClick(cell.date)}
                      className={`h-7 w-7 mx-auto rounded-full flex items-center justify-center relative text-white ${
                        !cell.currentMonth ? "opacity-40" : ""
                      } ${
                        disabledDay ? "opacity-30 cursor-not-allowed" : "hover:opacity-80"
                      }`}
                      style={
                        selected
                          ? { backgroundColor: "#fff", color: panelColor, fontWeight: 600 }
                          : isToday
                          ? { border: "1px solid rgba(255,255,255,0.8)" }
                          : undefined
                      }
                    >
                      {cell.day}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === "time" && (
            <div>
              <div className="text-sm font-semibold mb-3 text-white">Set time</div>
              <div className="relative flex items-center justify-center">
                <div
                  className="pointer-events-none absolute left-0 right-0 border-y"
                  style={{ top: ITEM_HEIGHT, height: ITEM_HEIGHT, borderColor: "rgba(255,255,255,0.3)" }}
                />
                <WheelColumn ref={hourWheelRef} values={hourValues} initialSelected={hour12} isDark={true} />
                <div className="flex items-center" style={{ height: ITEM_HEIGHT * 3 }}>
                  <span className="font-semibold text-white">:</span>
                </div>
                <WheelColumn ref={minuteWheelRef} values={minuteValues} initialSelected={minute} isDark={true} />
                <div className="flex items-center" style={{ height: ITEM_HEIGHT * 3 }}>
                  <span className="font-semibold text-white">:</span>
                </div>
                <WheelColumn ref={secondWheelRef} values={secondValues} initialSelected={second} isDark={true} />
                <div style={{ width: 12 }} />
                <WheelColumn ref={ampmWheelRef} values={["AM", "PM"]} initialSelected={ampm} isDark={true} width={36} />
              </div>
              <div className="flex justify-between mt-3">
                <button
                  type="button"
                  onClick={() => setStep("date")}
                  className="text-xs px-3 py-1 rounded text-white opacity-90"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={commitTimeSelection}
                  className="text-xs px-3 py-1 rounded font-semibold"
                  style={{ backgroundColor: "#fff", color: panelColor }}
                >
                  Done
                </button>
              </div>
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
      fillContainer={fillContainer}
      required={required}
    >
      {datePickerElement}
    </CommonHeaderAndTooltip>
  );
};
