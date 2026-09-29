"use client";

import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useGlobal } from "@/context/GlobalContext";
import { useEventBus } from "@/context/EventBusContext";
import { Tooltip } from "./Tooltip";
import { HeaderPosition, TooltipProps as TooltipPropsType, ComponentEvents } from "@/types/global";
import { getBorderRadiusClass } from "@/app/utils/branding";
import { CommonHeaderAndTooltip } from "./CommonHeaderAndTooltip";

export interface SignatureRef {
  clear: () => void;
  toDataURL: (type?: string, encoderOptions?: number) => string;
  fromDataURL: (dataURL: string) => void;
  isEmpty: () => boolean;
}

interface SignatureProps {
  nodeId?: string;
  value?: string;
  title?: string;
  headerText?: string;
  headerPosition?: HeaderPosition;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  disabled?: boolean;
  readOnly?: boolean;
  require?: boolean;
  penColor?: string;
  backgroundColor?: string;
  needClear?: boolean;
  clearButtonText?: string;
  onChange?: (signature: string) => void;
  onEnd?: () => void;
  events?: ComponentEvents[];
  className?: string;
}

export const Signature = forwardRef<SignatureRef, SignatureProps>(({
  nodeId,
  value = "",
  title,
  headerText,
  headerPosition = "top",
  needTooltip = false,
  tooltipProps,
  disabled = false,
  readOnly = false,
  require = false,
  penColor,
  backgroundColor,
  needClear = false,
  clearButtonText = "Clear",
  onChange,
  onEnd,
  events,
  className = "",
}, ref) => {
  const { theme, branding } = useGlobal();
  const eventBus = useEventBus();
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isDisabled, setIsDisabled] = useState(disabled);
  const [isVisible, setIsVisible] = useState(true);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    clear: () => {
      sigCanvas.current?.clear();
    },
    toDataURL: (type?: string, encoderOptions?: number) => {
      return sigCanvas.current?.toDataURL(type, encoderOptions) || "";
    },
    fromDataURL: (dataURL: string) => {
      sigCanvas.current?.fromDataURL(dataURL);
    },
    isEmpty: () => {
      return sigCanvas.current?.isEmpty() ?? true;
    },
  }));

  // Load existing signature
  useEffect(() => {
    if (sigCanvas.current && value) {
      sigCanvas.current.fromDataURL(value);
    }
  }, [value]);

  // Subscribe to riseListen events
  useEffect(() => {
    if (!nodeId || !events) return;

    const unsubscribers: (() => void)[] = [];

    events.forEach(event => {
      if (event.enabled && event.riseListen) {
        event.riseListen.forEach(listener => {
          const subscribe = listener.listenerType === "type1"
            ? eventBus.subscribeGlobal
            : (key: string, cb: any) => eventBus.subscribe(key, nodeId, cb);

          const unsubscribe = subscribe(listener.key, (payload) => {
            switch (listener.key) {
              case "hideElement":
                setIsVisible(false);
                break;
              case "showElement":
                setIsVisible(true);
                break;
              case "disableElement":
                setIsDisabled(true);
                break;
              case "enableElement":
                setIsDisabled(false);
                break;
              case "clearHandler":
                handleClear();
                break;
              case "refreshElement":
                if (payload.data?.value !== undefined) {
                  if (sigCanvas.current) {
                    if (payload.data.value) {
                      sigCanvas.current.fromDataURL(payload.data.value);
                    } else {
                      sigCanvas.current.clear();
                    }
                  }
                }
                break;
              default:
                console.log(`Signature ${nodeId} received event: ${listener.key}`, payload);
            }
          });

          unsubscribers.push(unsubscribe);
        });
      }
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [nodeId, events, eventBus]);

  const handleEnd = () => {
    if (sigCanvas.current && !isDisabled && !readOnly) {
      const signature = sigCanvas.current.toDataURL();
      onChange?.(signature);
      onEnd?.();

      // Emit rise events when signature ends
      const onEndEvent = events?.find(e => e.name === "onEnd" || e.name === "onChange");
      if (onEndEvent?.enabled && onEndEvent.rise && nodeId) {
        onEndEvent.rise.forEach(riseEvent => {
          eventBus.emit(riseEvent.key, {
            nodeId,
            data: { value: signature },
          });
        });
      }
    }
  };

  const handleClear = () => {
    if (sigCanvas.current && !isDisabled && !readOnly) {
      sigCanvas.current.clear();
      onChange?.("");

      // Emit rise events when cleared
      const onChangeEvent = events?.find(e => e.name === "onChange");
      if (onChangeEvent?.enabled && onChangeEvent.rise && nodeId) {
        onChangeEvent.rise.forEach(riseEvent => {
          eventBus.emit(riseEvent.key, {
            nodeId,
            data: { value: "" },
          });
        });
      }
    }
  };

  const isDark = theme === "dark" || theme === "dark-hc";

  // Helper to convert hex to rgba
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex?.slice(1, 3), 16);
    const g = parseInt(hex?.slice(3, 5), 16);
    const b = parseInt(hex?.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Determine pen and background colors based on theme
  const defaultPenColor = penColor || (isDark ? "#fff" : "#000");
  const defaultBackgroundColor = backgroundColor || (isDark ? "#1F2937" : "#fff");

  const signatureElement = (
    <div className={`w-full h-full flex flex-col overflow-hidden  ${className}`}>
      {title && (
        <h3
          className={`mb-2 font-semibold ${
            isDark ? "text-gray-200" : "text-gray-700"
          }`}
          style={{ fontFamily: "var(--font-body)" }}
        >
          {title}
        </h3>
      )}

      <div className="h-full w-full flex-1 overflow-hidden">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            tabIndex: 0,
            className: `
              w-full
              border-2
              ${getBorderRadiusClass(branding.borderRadius)}
              ${isDark ? "border-gray-600" : "border-gray-300"}
              ${isDisabled || readOnly ? "cursor-not-allowed opacity-50" : "cursor-crosshair"}
              transition-all duration-200
              focus:outline-none
            `,
            style: {
              width: "100%",
              height: "100%",
              borderRadius: "var(--border-radius)",
              fontFamily: "var(--font-body)",
            },
            onMouseEnter: (e: React.MouseEvent<HTMLCanvasElement>) => {
              if (!isDisabled && !readOnly) {
                e.currentTarget.style.borderColor = branding.hoverColor;
              }
            },
            onMouseLeave: (e: React.MouseEvent<HTMLCanvasElement>) => {
              if (!isDisabled && !readOnly && document.activeElement !== e.currentTarget) {
                e.currentTarget.style.borderColor = isDark ? "#4B5563" : "#D1D5DB";
              }
            },
            onClick: (e: React.MouseEvent<HTMLCanvasElement>) => {
              if (!isDisabled && !readOnly) {
                e.currentTarget.focus();
              }
            },
            onFocus: (e: React.FocusEvent<HTMLCanvasElement>) => {
              if (!isDisabled && !readOnly) {
                e.currentTarget.style.borderColor = branding.selectionColor;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${hexToRgba(branding.selectionColor, 0.2)}`;
              }
            },
            onBlur: (e: React.FocusEvent<HTMLCanvasElement>) => {
              if (!isDisabled && !readOnly) {
                e.currentTarget.style.borderColor = isDark ? "#4B5563" : "#D1D5DB";
                e.currentTarget.style.boxShadow = "none";
              }
            },
          }}
          penColor={defaultPenColor}
          backgroundColor={defaultBackgroundColor}
          onEnd={handleEnd}
          clearOnResize={false}
        />
      </div>

      {needClear && (
        <button
          onClick={handleClear}
          disabled={isDisabled || readOnly}
          className={`
            mt-2
            px-4
            py-2
            font-medium
            ${getBorderRadiusClass(branding.borderRadius)}
            transition-all duration-200
            focus:outline-none
            ${isDisabled || readOnly
              ? "opacity-50 cursor-not-allowed bg-gray-300 text-gray-500"
              : ""
            }
          `}
          style={{
            fontFamily: "var(--font-body)",
            borderRadius: "var(--border-radius)",
            backgroundColor: isDisabled || readOnly ? undefined : branding.brandColor,
            color: isDisabled || readOnly ? undefined : "#ffffff",
          }}
          onMouseEnter={(e) => {
            if (!isDisabled && !readOnly) {
              e.currentTarget.style.backgroundColor = branding.hoverColor;
            }
          }}
          onMouseLeave={(e) => {
            if (!isDisabled && !readOnly) {
              e.currentTarget.style.backgroundColor = branding.brandColor;
            }
          }}
          onFocus={(e) => {
            if (!isDisabled && !readOnly) {
              e.currentTarget.style.backgroundColor = branding.selectionColor;
            }
          }}
          onBlur={(e) => {
            if (!isDisabled && !readOnly) {
              e.currentTarget.style.boxShadow = "none";
            }
          }}
        >
          {clearButtonText}
        </button>
      )}
    </div>
  );
  

  // Don't render if hidden by event
  if (!isVisible) {
    return null;
  }


return (
  <CommonHeaderAndTooltip
    needTooltip={needTooltip}
    tooltipProps={tooltipProps}
    headerText={headerText}
    headerPosition={headerPosition}
    className={className}
    fillContainer
  >
    {signatureElement}
  </CommonHeaderAndTooltip>
);
});

Signature.displayName = "Signature";