"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme } from "@/hooks/useTheme";
import { Tooltip } from "./Tooltip";
import { Icon } from "./Icon";
import { ComponentSize, HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { getBorderRadiusClass } from "@/app/utils/branding";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  icon?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | string[];
  defaultValue?: string | string[];
  onChange?: (value: string | string[]) => void;
  onBlur?: () => void;
  size?: ComponentSize;
  placeholder?: string;
  disabled?: boolean;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  label?: string;
  validationState?: 'valid' | 'invalid';
  errorMessage?: string;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  className?: string;
  customRenderSelectedLabels?: string | undefined;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  defaultValue,
  onChange,
  onBlur,
  size = "m",
  placeholder = "Select an option",
  disabled = false,
  multiple = false,
  searchable = false,
  clearable = false,
  label,
  validationState,
  errorMessage,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
  customRenderSelectedLabels ,
}) => {
  const { isDark, isHighContrast, branding } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [internalValue, setInternalValue] = useState<string | string[]>(
    value !== undefined ? value : defaultValue || (multiple ? [] : "")
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Sync with value prop
  useEffect(() => {
    if (value !== undefined) {
      setInternalValue(value);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onBlur]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  const getSizeClasses = () => {
    switch (size) {
      case "xs": return "px-[0.5em] py-[0.25em]";
      case "s":  return "px-[0.75em] py-[0.375em]";
      case "l":  return "px-[1.25em] py-[0.625em]";
      case "xl": return "px-[1.5em] py-[0.75em]";
      case "m":
      default:   return "px-[1em] py-[0.5em]";
    }
  };

  const getBorderColorClass = () => {
    if (validationState === 'valid') {
      return 'border-green-500';
    }
    if (validationState === 'invalid') {
      return 'border-red-500';
    }
    return isDark ? 'border-gray-600' : 'border-gray-300';
  };

  const filteredOptions = searchable && searchTerm
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleOptionClick = (optionValue: string) => {
    if (disabled) return;

    let newValue: string | string[];

    if (multiple) {
      const currentValues = Array.isArray(internalValue) ? internalValue : [];
      if (currentValues.includes(optionValue)) {
        newValue = currentValues.filter(v => v !== optionValue);
      } else {
        newValue = [...currentValues, optionValue];
      }
    } else {
      newValue = optionValue;
      setIsOpen(false);
      setSearchTerm("");
    }

    // Only update internal state if not controlled
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newValue = multiple ? [] : "";
    if (value === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };

  const isSelected = (optionValue: string) => {
    if (multiple) {
      return Array.isArray(internalValue) && internalValue.includes(optionValue);
    }
    return internalValue === optionValue;
  };

  const getSelectedLabels = () => {
    if(customRenderSelectedLabels) {
      return customRenderSelectedLabels;
    }
    if (multiple) {
      const values = Array.isArray(internalValue) ? internalValue : [];
      if (values.length === 0) return placeholder;
      return values
        .map(v => options.find(opt => opt.value === v)?.label)
        .filter(Boolean)
        .join(", ");
    }
    const selectedOption = options.find(opt => opt.value === internalValue);
    return selectedOption ? selectedOption.label : placeholder;
  };

  const hasValue = multiple
    ? Array.isArray(internalValue) && internalValue.length > 0
    : internalValue !== "";

  const selectElement = (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Label */}
      {label && (
        <label
          className={`block mb-2 font-medium ${
            isDark ? "text-gray-200" : "text-gray-900"
          }`}
        >
          {label}
        </label>
      )}

      {/* Select Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onBlur={onBlur}
        disabled={disabled}
        className={`
          ${getSizeClasses()}
          ${getBorderRadiusClass(branding.borderRadius)}
          ${getBorderColorClass()}
          w-full
          flex items-center justify-between
          border-2
          transition-all
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          ${isOpen ? "ring-2" : ""}
          ${isHighContrast ? 'font-medium' : ''}
        `}
        style={{
          backgroundColor: isDark ? "#374151" : "#FFFFFF",
          color: isDark ? "#F9FAFB" : "#111827",
          ...(isOpen && { borderColor: branding.brandColor, boxShadow: `0 0 0 2px ${branding.brandColor}20` }),
        }}
      >
        <span className={hasValue ? "" : "text-gray-400"}>
          {getSelectedLabels()}
        </span>

        <div className="flex items-center gap-2">
          {clearable && hasValue && !disabled && (
            <div
              onClick={handleClear}
              className={`
                p-1 rounded
                transition-colors
                ${isDark ? "hover:bg-gray-600" : "hover:bg-gray-200"}
              `}
            >
              <Icon data="FaWindowClose" size={16} />
            </div>
          )}
          <Icon
            data={isOpen ? "FaAngleUp" : "FaAngleDown"}
            size={16}
            className="transition-transform"
          />
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute
            z-50
            w-full
            mt-1
            ${getBorderRadiusClass(branding.borderRadius)}
            border-2
            shadow-lg
            max-h-60
            overflow-hidden
            flex flex-col
          `}
          style={{
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            borderColor: isDark ? "#4B5563" : "#E5E7EB",
          }}
        >
          {/* Search Input */}
          {searchable && (
            <div className="p-2 border-b" style={{ borderColor: isDark ? "#4B5563" : "#E5E7EB" }}>
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className={`
                  w-full
                  px-3 py-2
                  ${getBorderRadiusClass(branding.borderRadius)}
                  border
                                   focus:outline-none
                  focus:ring-2
                `}
                style={{
                  backgroundColor: isDark ? "#374151" : "#FFFFFF",
                  borderColor: isDark ? "#4B5563" : "#D1D5DB",
                  color: isDark ? "#F9FAFB" : "#111827",
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Options */}
          <div className="overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div
                className={`px-4 py-3 text-center text-[clamp(5px,0.675vw,18px)]`}
                style={{ color: isDark ? "#9CA3AF" : "#6B7280" }}
              >
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const selected = isSelected(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => !option.disabled && handleOptionClick(option.value)}
                    disabled={option.disabled}
                    className={`
                      w-full
                      px-4 py-2
                      flex items-center justify-between
                      transition-colors
                                           ${option.disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                      ${selected ? "" : isDark ? "hover:bg-gray-700" : "hover:bg-gray-100"}
                    `}
                    style={{
                      backgroundColor: selected ? branding.brandColor : "transparent",
                      color: selected ? "#FFFFFF" : isDark ? "#F9FAFB" : "#111827",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {option.icon && <Icon fillContainer={false} data={option.icon} size={16} />}
                      <span>{option.label}</span>
                    </div>
                    {selected && <Icon fillContainer={false} data="FaCheck" size={16} />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Error Message */}
      {validationState === 'invalid' && errorMessage && (
        <div className={`mt-1 text-sm text-red-500 text-[clamp(5px,0.675vw,18px)]`}>
          {errorMessage}
        </div>
      )}
    </div>
  );

  const renderWithHeader = (element: React.ReactNode) => {
    if (!headerText) return element;

    const headerClasses = `font-semibold mb-2 ${
      isDark ? "text-gray-300" : "text-gray-700"
    }`;

    switch (headerPosition) {
      case "top":
        return (
          <div className="flex flex-col">
            <div className={headerClasses}>{headerText}</div>
            {element}
          </div>
        );
      case "bottom":
        return (
          <div className="flex flex-col">
            {element}
            <div className={`${headerClasses} mt-2 mb-0`}>{headerText}</div>
          </div>
        );
      case "left":
        return (
          <div className="flex items-start gap-4">
            <div className={`${headerClasses} mb-0 whitespace-nowrap`}>
              {headerText}
            </div>
            {element}
          </div>
        );
      case "right":
        return (
          <div className="flex items-start gap-4">
            {element}
            <div className={`${headerClasses} mb-0 whitespace-nowrap`}>
              {headerText}
            </div>
          </div>
        );
    }
  };

  const finalElement = renderWithHeader(selectElement);

  if (needTooltip && tooltipProps) {
    return (
      <Tooltip title={tooltipProps.title} placement={tooltipProps.placement}>
        {finalElement}
      </Tooltip>
    );
  }

  return <>{finalElement}</>;
};