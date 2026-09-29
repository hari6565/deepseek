"use client";

import React, { useState, useEffect, useRef } from "react";
import { useGlobal } from "@/context/GlobalContext";
import { useInfoMsg } from "@/app/components/infoMsgHandler";
import { Tooltip } from "./Tooltip";
import { Radio } from "./Radio";
import { CheckboxSize, HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

type ContentAlign = "left" | "center" | "right";
interface RadioGroupItem {
  value: string;
  content: string;
}

interface RadioGroupProps {
  disabled?: boolean;
  direction?: "horizontal" | "vertical";
  items: RadioGroupItem[];
  value?: string;
  defaultValue?: string;
  content?: string;
  contentAlign?: ContentAlign;
  // validation
  validationState?: 'valid' | 'invalid';
  errorMessage?: string;
  require?: boolean;

  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  onChange?: (value: string) => void;
  className?: string;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({
  disabled = false,
  direction = "vertical",
  items,
  value = "",
  defaultValue = "",
  content = "",
  contentAlign = "center",
  validationState,
  errorMessage,
  require = false,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  onChange,
  className = "",
}) => {
  const { theme, direction: globalDirection } = useGlobal();
  const showToast = useInfoMsg();
  const [selectedValue, setSelectedValue] = useState(value || defaultValue);

  // Sync internal value when prop changes — mirrors TextInput's value sync useEffect
  useEffect(() => {
    // Only sync if value is actually provided (not empty string)
    if (value) {
      setSelectedValue(value);
    }
  }, [value]);

  // Show danger toast when validation fails — mirrors TextInput's validationState useEffect
  useEffect(() => {
    if (validationState === 'invalid' && errorMessage) {
      showToast(errorMessage, 'danger');
    }
  }, [validationState, errorMessage]);

  const handleChange = (newValue: string) => {
    setSelectedValue(newValue);
    onChange?.(newValue);
  };

  const isDark = theme === "dark" || theme === "dark-hc";
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
  const radioGroupElement = (
    <div
      className={`w-full h-full flex gap-2 overflow-hidden ${direction === "horizontal" ? "flex-row flex-auto shrink" : "flex-col"} 
        p-2 rounded-md border transition-colors
        ${validationState === 'invalid' ? 'border-red-500' : 'border-transparent'}`}
    >
      {items.map((item) => (
        <Radio
          key={item.value}
          checked={selectedValue === item.value}
          disabled={disabled}
          content={item.content}
          className={className}
          value={item.value}
          name="radio-group"
          onChange={handleChange}
        />
      ))}
    </div>
  );

  return (
    <CommonHeaderAndTooltip
      needTooltip={needTooltip}
      tooltipProps={tooltipProps}
      headerText={headerText}
      headerPosition={headerPosition}
      className={className}
      required={require}
    >
      {radioGroupElement}
    </CommonHeaderAndTooltip>
  );
};