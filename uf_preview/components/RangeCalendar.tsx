"use client";

import React, { useState, useEffect } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { Tooltip } from "./Tooltip";
import { HeaderPosition, TooltipProps as TooltipPropsType, ComponentSize } from "@/types/global";
import { getBorderRadiusClass } from "@/app/utils/branding";

// DateTime type based on common date libraries
export interface DateTime {
  year?: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
}

export interface RangeValue<T> {
  start: T;
  end: T;
}

export type RangeCalendarLayout = "days" | "months" | "quarters" | "years";

interface RangeCalendarProps {
  // Core props
  value?: RangeValue<DateTime> | null;
  defaultValue?: RangeValue<DateTime>;
  onChange?: (value: RangeValue<DateTime>) => void;
  onUpdate?: (value: DateTime) => void;

  // Focus props
  focusedValue?: DateTime | null;
  defaultFocusedValue?: DateTime;
  onFocusUpdate?: (date: DateTime) => void;
  onFocus?: (e: React.FocusEvent<Element, Element>) => void;
  onBlur?: (e: React.FocusEvent<Element, Element>) => void;

  // Mode props
  mode?: RangeCalendarLayout;
  defaultMode?: RangeCalendarLayout;
  onUpdateMode?: (value: RangeCalendarLayout) => void;
  modes?: Partial<Record<RangeCalendarLayout, boolean>>;

  // Date constraints
  minValue?: DateTime;
  maxValue?: DateTime;
  isDateUnavailable?: (date: DateTime) => boolean;
  isWeekend?: (date: DateTime) => boolean;

  // Display props
  size?: ComponentSize;
  className?: string;
  style?: React.CSSProperties;

  // State props
  disabled?: boolean;
  readOnly?: boolean;
  autoFocus?: boolean;

  // Accessibility props
  id?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;

  // Time zone
  timeZone?: string;

  // Custom wrapper props
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  validationState?: "valid" | "invalid" | "none";
  errorMessage?: string;
  width?: string;
}

export const RangeCalendar: React.FC<RangeCalendarProps> = ({
  value,
  defaultValue,
  onChange,
  onUpdate,
  focusedValue,
  defaultFocusedValue,
  onFocusUpdate,
  onFocus,
  onBlur,
  mode = "days",
  defaultMode,
  onUpdateMode,
  modes = { days: true, months: true, quarters: false, years: true },
  minValue,
  maxValue,
  isDateUnavailable,
  isWeekend,
  size = "m",
  className = "",
  style,
  disabled = false,
  readOnly = false,
  autoFocus = false,
  id,
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledby,
  "aria-describedby": ariaDescribedby,
  "aria-details": ariaDetails,
  timeZone,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  validationState = "none",
  errorMessage,
  width = "100%",
}) => {
  const { theme, direction, branding } = useGlobal();
  const [internalValue, setInternalValue] = useState<RangeValue<DateTime> | null>(
    value || defaultValue || null
  );
  const [currentMode, setCurrentMode] = useState<RangeCalendarLayout>(mode || defaultMode || "days");
  const [viewingDate, setViewingDate] = useState<DateTime>({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    day: new Date().getDate(),
  });
  const [selectingStart, setSelectingStart] = useState(true);
  const [tempStart, setTempStart] = useState<DateTime | null>(null);

  // Sync with external value
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  const handleValueChange = (newValue: RangeValue<DateTime>) => {
    if (readOnly || disabled) return;

    setInternalValue(newValue);
    onChange?.(newValue);
  };

  const handleModeChange = (newMode: RangeCalendarLayout) => {
    setCurrentMode(newMode);
    onUpdateMode?.(newMode);
  };

  const isFutureDate = (date: DateTime): boolean => {
    const todayDate = new Date();
    const today = {
      year: todayDate.getFullYear(),
      month: todayDate.getMonth() + 1,
      day: todayDate.getDate()
    };
    return compareDates(date, today) > 0;
  };


  // Helper function to generate calendar days
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const generateCalendarDays = () => {
    const year = viewingDate.year || new Date().getFullYear();
    const month = viewingDate.month || new Date().getMonth() + 1;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: (DateTime | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ year, month, day });
    }

    return days;
  };

  const handleDateClick = (date: DateTime) => {
    if (disabled || readOnly) return;

    if (selectingStart || !tempStart) {
      setTempStart(date);
      setSelectingStart(false);
    } else {
      // Determine start and end
      const start = compareDates(tempStart, date) <= 0 ? tempStart : date;
      const end = compareDates(tempStart, date) <= 0 ? date : tempStart;

      const newValue: RangeValue<DateTime> = { start, end };
      handleValueChange(newValue);
      setSelectingStart(true);
      setTempStart(null);
    }
  };

  const compareDates = (date1: DateTime, date2: DateTime): number => {
    const y1 = date1.year || 0;
    const m1 = date1.month || 0;
    const d1 = date1.day || 0;
    const y2 = date2.year || 0;
    const m2 = date2.month || 0;
    const d2 = date2.day || 0;

    if (y1 !== y2) return y1 - y2;
    if (m1 !== m2) return m1 - m2;
    return d1 - d2;
  };

  const isDateInRange = (date: DateTime): boolean => {
    if (!internalValue) return false;
    const cmp1 = compareDates(date, internalValue.start);
    const cmp2 = compareDates(date, internalValue.end);
    return cmp1 >= 0 && cmp2 <= 0;
  };

  const isDateSelected = (date: DateTime): "start" | "end" | "range" | null => {
    if (!internalValue) return null;

    if (compareDates(date, internalValue.start) === 0) return "start";
    if (compareDates(date, internalValue.end) === 0) return "end";
    if (isDateInRange(date)) return "range";

    return null;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const year = viewingDate.year || new Date().getFullYear();
    const month = viewingDate.month || new Date().getMonth() + 1;

    if (direction === "prev") {
      if (month === 1) {
        setViewingDate({ ...viewingDate, year: year - 1, month: 12 });
      } else {
        setViewingDate({ ...viewingDate, month: month - 1 });
      }
    } else {
      if (month === 12) {
        setViewingDate({ ...viewingDate, year: year + 1, month: 1 });
      } else {
        setViewingDate({ ...viewingDate, month: month + 1 });
      }
    }
  };

  const isDark = theme === "dark" || theme === "dark-hc";


  const getBorderColor = () => {
    if (validationState === "invalid") return "border-red-500";
    if (validationState === "valid") return "border-green-500";
    return isDark ? "border-gray-600" : "border-gray-300";
  };

  const formatDate = (date: DateTime | null | undefined): string => {
    if (!date) return "";
    const { year, month, day } = date;
    return `${year || ""}-${month || ""}-${day || ""}`;
  };

  const calendarElement = (
    <div className="w-full" style={{ width }}>
      <div
        id={id}
        className={`
          ${getBorderRadiusClass(branding.borderRadius)}
          border-2
          ${getBorderColor()}
          ${isDark ? "bg-gray-800 text-white" : "bg-white text-gray-900"}
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${readOnly ? "pointer-events-none" : ""}
          transition-colors
          ${className}
        `}
        style={{
          ...style,
          direction: direction === "RTL" ? "rtl" : "ltr",
        }}
        aria-label={ariaLabel}
        aria-labelledby={ariaLabelledby}
        aria-describedby={ariaDescribedby}
        aria-details={ariaDetails}
        tabIndex={autoFocus ? 0 : undefined}
      >
        {/* Mode Selector */}
        <div className="flex gap-2 mb-4 pb-3 border-b" style={{
          borderColor: isDark ? "#4B5563" : "#D1D5DB"
        }}>
          {Object.entries(modes).map(([layoutMode, enabled]) => {
            if (!enabled) return null;
            const isActive = currentMode === layoutMode;
            return (
              <button
                key={layoutMode}
                onClick={() => handleModeChange(layoutMode as RangeCalendarLayout)}
                disabled={disabled || readOnly}
                className={`
                  px-3 py-1
                  ${getBorderRadiusClass(branding.borderRadius)}
                  transition-colors
                  ${isActive
                    ? "text-white"
                    : isDark ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"
                  }
                  ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                `}
                style={{
                  backgroundColor: isActive ? branding.brandColor : undefined,
                }}
              >
                {layoutMode.charAt(0).toUpperCase() + layoutMode.slice(1)}
              </button>
            );
          })}
        </div>

        {/* Calendar Content */}
        <div className="calendar-content">
          {/* Month/Year Navigation */}
          {currentMode === "days" && (
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateMonth("prev")}
                disabled={disabled || readOnly}
                className={`p-2 ${getBorderRadiusClass(branding.borderRadius)} ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-gray-700 dark:hover:bg-gray-600"
                  } transition-colors`}
              >
                ←
              </button>
              <div className={`font-semibold `}>
                {new Date(viewingDate.year || 0, (viewingDate.month || 1) - 1).toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </div>
              <button
                onClick={() => navigateMonth("next")}
                disabled={disabled || readOnly}
                className={`p-2 ${getBorderRadiusClass(branding.borderRadius)} ${disabled ? "cursor-not-allowed opacity-50" : "hover:bg-gray-700 dark:hover:bg-gray-600"
                  } transition-colors`}
              >
                â†’
              </button>
            </div>
          )}

          {/* Calendar Grid for Days Mode */}
          {currentMode === "days" && (
            <div>
              {/* Week day headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div
                    key={day}
                    className={`text-center text-xs font-semibold py-2 ${isDark ? "text-gray-400" : "text-gray-600"
                      }`}
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days grid */}
              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((date, index) => {
                  if (!date) {
                    return <div key={`empty-${index}`} className="aspect-square" />;
                  }

                  const selectionType = isDateSelected(date);
                  const isStart = selectionType === "start";
                  const isEnd = selectionType === "end";
                  const isInRange = selectionType === "range";
                  const isTemp = tempStart && compareDates(date, tempStart) === 0;
                  const futureDate = isFutureDate(date);

                  return (
                    <button
                      key={`${date.year}-${date.month}-${date.day}`}
                      onClick={() => !futureDate && handleDateClick(date)}
                      disabled={disabled || readOnly || futureDate}
                      className={`
                          aspect-square flex items-center justify-center
                          ${getBorderRadiusClass(branding.borderRadius)}
                          transition-all
                          
                          ${futureDate ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                          ${disabled || readOnly ? "opacity-50 cursor-not-allowed" : ""}

                          ${isStart || isEnd
                          ? "text-white font-bold"
                          : isInRange
                            ? isDark
                              ? "bg-gray-700 text-white"
                              : "bg-gray-200 text-gray-900"
                            : isTemp
                              ? isDark
                                ? "bg-gray-600 text-white"
                                : "bg-gray-300 text-gray-900"
                              : isDark
                                ? "text-gray-300 hover:bg-gray-700"
                                : "text-gray-700 hover:bg-gray-100"
                        }
                        `}
                      style={{
                        backgroundColor: isStart || isEnd ? branding.brandColor : undefined
                      }}
                    >
                      {date.day}
                    </button>

                  );
                })}
              </div>
            </div>
          )}

          {/* Months Mode Grid */}
          {currentMode === "months" && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                <button
                  key={month}
                  onClick={() => {
                    const date: DateTime = {
                      year: viewingDate.year,
                      month,
                      day: 1,
                    };
                    handleDateClick(date);
                  }}
                  disabled={disabled || readOnly}
                  className={`
                    p-4
                    ${getBorderRadiusClass(branding.borderRadius)}
                    transition-colors
                    ${isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                    ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  `}
                >
                  {new Date(2024, month - 1).toLocaleDateString("en-US", { month: "short" })}
                </button>
              ))}
            </div>
          )}

          {/* Years Mode Grid */}
          {currentMode === "years" && (
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, i) => (viewingDate.year || 2024) - 6 + i).map((year) => (
                <button
                  key={year}
                  onClick={() => {
                    const date: DateTime = {
                      year,
                      month: 1,
                      day: 1,
                    };
                    handleDateClick(date);
                  }}
                  disabled={disabled || readOnly}
                  className={`
                    p-4
                    ${getBorderRadiusClass(branding.borderRadius)}
                    transition-colors
                    ${isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                    ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  `}
                >
                  {year}
                </button>
              ))}
            </div>
          )}

          {/* Quarters Mode Grid */}
          {currentMode === "quarters" && (
            <div className="grid grid-cols-2 gap-2">
              {["Q1", "Q2", "Q3", "Q4"].map((quarter, index) => (
                <button
                  key={quarter}
                  onClick={() => {
                    const date: DateTime = {
                      year: viewingDate.year,
                      month: index * 3 + 1,
                      day: 1,
                    };
                    handleDateClick(date);
                  }}
                  disabled={disabled || readOnly}
                  className={`
                    p-6
                    ${getBorderRadiusClass(branding.borderRadius)}
                    transition-colors
                    ${isDark
                      ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }
                    ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
                  `}
                >
                  {quarter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {validationState === "invalid" && errorMessage && (
        <div className={`mt-1 text-red-500`}>
          {errorMessage}
        </div>
      )}
    </div>
  );

  const renderWithHeader = (element: React.ReactNode) => {
    if (!headerText) return element;

    const headerClasses = ` font-semibold mb-2 ${isDark ? "text-gray-300" : "text-gray-700"
      }`;

    switch (headerPosition) {
      case "top":
        return (
          <div className="flex flex-col w-full">
            <div className={headerClasses}>{headerText}</div>
            {element}
          </div>
        );
      case "bottom":
        return (
          <div className="flex flex-col w-full">
            {element}
            <div className={`${headerClasses} mt-2 mb-0`}>{headerText}</div>
          </div>
        );
      case "left":
        return (
          <div className="flex items-start gap-4 w-full">
            <div className={`${headerClasses} mb-0 whitespace-nowrap`}>
              {headerText}
            </div>
            <div className="flex-1">{element}</div>
          </div>
        );
      case "right":
        return (
          <div className="flex items-start gap-4 w-full">
            <div className="flex-1">{element}</div>
            <div className={`${headerClasses} mb-0 whitespace-nowrap`}>
              {headerText}
            </div>
          </div>
        );
      default:
        return element;
    }
  };

  const finalElement = renderWithHeader(calendarElement);

  if (needTooltip && tooltipProps) {
    return (
      <Tooltip
        title={tooltipProps.title}
        placement={tooltipProps.placement}
        disable={disabled}
      >
        {finalElement}
      </Tooltip>
    );
  }

  return <>{finalElement}</>;
};
