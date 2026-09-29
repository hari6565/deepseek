"use client";

import React, { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import { useTheme } from "@/hooks/useTheme";
import { eventBus } from "@/app/eventBus";
import { Tooltip } from "./Tooltip";
import { Icon } from "./Icon";
import { Text, TextVariant } from './Text'
import { Button } from "./Button";
import { ComponentSize, HeaderPosition, TooltipProps as TooltipPropsType } from "@/types/global";
import { getBorderRadiusClass } from "@/app/utils/branding";

type ModalPosition =
  | "center"
  | "top"
  | "bottom"
  | "left"
  | "right"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center-left"
  | "center-right";

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "full" | "auto";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string | React.ReactNode;
  variant?: TextVariant
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  needTooltip?: boolean;
  tooltipProps?: TooltipPropsType;
  headerText?: string;
  headerPosition?: HeaderPosition;
  className?: string;
  position?: ModalPosition;
  showOverlay?: boolean;
  modalName?: string;
  // When provided and false, children still mount (so they can start
  // loading their own data) but the reveal is held at the invisible
  // "measuring" phase until this becomes true -- lets a caller open the
  // modal only once its content is actually ready, instead of showing it
  // half-loaded. Omit this prop to keep the default behavior (reveal as
  // soon as open is true).
  ready?: boolean;
}

let nextModalId = 0;
let openModalIds: number[] = [];
const modalStackListeners = new Set<() => void>();
function notifyModalStackListeners() {
  modalStackListeners.forEach((listener) => listener());
}
function subscribeModalStack(listener: () => void) {
  modalStackListeners.add(listener);
  return () => {
    modalStackListeners.delete(listener);
  };
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,

  title,
  variant,
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  children,
  footer,
  needTooltip = false,
  tooltipProps,
  headerText,
  headerPosition = "top",
  className = "",
  position = "center",
  showOverlay = true,
  modalName,
  ready,
}) => {
  const { isDark, isHighContrast, branding } = useTheme();

  const ANIMATION_DURATION = 300;
  const [shouldRender, setShouldRender] = useState(open);
  const [phase, setPhase] = useState<"measuring" | "visible" | "closing">(open ? "measuring" : "closing");

  // Stable identity for this instance's slot in the shared open-modal stack.
  const [modalId] = useState(() => ++nextModalId);

  useLayoutEffect(() => {
    if (phase === "visible" && !openModalIds.includes(modalId)) {
      openModalIds = [...openModalIds, modalId];
      notifyModalStackListeners();
    } else if (phase === "closing" && openModalIds.includes(modalId)) {
      openModalIds = openModalIds.filter((id) => id !== modalId);
      notifyModalStackListeners();
    }
    return () => {
      if (openModalIds.includes(modalId)) {
        openModalIds = openModalIds.filter((id) => id !== modalId);
        notifyModalStackListeners();
      }
    };
  }, [phase, modalId]);

  // True only for whichever modal is currently the most-recently-opened one
  // still mounted -- re-evaluated live via the subscription, so if it closes,
  // the next one down the stack picks up the backdrop automatically.
  const isTopmost = useSyncExternalStore(
    subscribeModalStack,
    () => openModalIds[openModalIds.length - 1] === modalId,
    () => false
  );

  useEffect(() => {
    if (open) {
      setShouldRender(true);
      setPhase("measuring");
      // `ready === false` means the caller has content still loading --
      // stay mounted-but-invisible and wait for `ready` to flip true
      // (this effect re-runs then, since `ready` is a dependency).
      if (ready === false) return;
      // Two rAFs: the first lets the just-mounted (invisible) dialog and its
      // children commit their initial layout, the second starts the reveal
      // on a fresh frame so the browser actually transitions from it.
      let raf2 = 0;
      const raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => setPhase("visible"));
      });
      return () => {
        cancelAnimationFrame(raf1);
        cancelAnimationFrame(raf2);
      };
    }
    if (shouldRender) {
      setPhase("closing");
      const timer = setTimeout(() => setShouldRender(false), ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [open, ready]);

  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Prevent body scroll while the modal is mounted, including during the
  // closing animation (unlocking early would let the background jump/scroll
  // while the dialog is still visibly fading out).
  useEffect(() => {
    if (shouldRender) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [shouldRender]);

  // Listen for closeModal event and close if modalName matches
  useEffect(() => {
    if (!modalName) return;

    const handleCloseModal = (name: string) => {
      if (name === modalName) {
        onClose();
      }
    };

    eventBus.on('closeModal', handleCloseModal);
    return () => {
      eventBus.off('closeModal', handleCloseModal);
    };
  }, [modalName, onClose]);

  if (!shouldRender) return null;

  const isVisible = phase === "visible";

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      // onClose();
    }
  };

  const getPositionClasses = (): string => {
    switch (position) {
      case "top":
        return "items-start justify-center pt-8";
      case "bottom":
        return "items-end justify-center pb-8";
      case "left":
        return "items-center justify-start pl-8";
      case "right":
        return "items-center justify-end pr-8";
      case "top-left":
        return "items-start justify-start pt-8 pl-8";
      case "top-right":
        return "items-start justify-end pt-8 pr-8";
      case "bottom-left":
        return "items-end justify-start pb-8 pl-8";
      case "bottom-right":
        return "items-end justify-end pb-8 pr-8";
      case "center-left":
        return "items-center justify-start pl-8";
      case "center-right":
        return "items-center justify-end pr-8";
      case "center":
      default:
        return "items-center justify-center";
    }
  };

  const overlayStyles: React.CSSProperties = {
    ...(showOverlay && isTopmost
      ? {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }
      : {}),
    opacity: isVisible ? 1 : 0,
    pointerEvents: phase === "measuring" ? "none" : "auto",
  };

  const modalElement = (
    <div
      className={`fixed inset-0 z-50 flex rounded-lg transition-opacity duration-300 ease-in-out ${getPositionClasses()}`}
      style={overlayStyles}
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`
          ${className}
          flex flex-col
          transition-all duration-300 ease-in-out
          hover:shadow-2xl
          rounded-lg
        `}
        style={{
          backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
          borderColor: isDark ? "#4B5563" : "#E5E7EB",
          color: isDark ? "#F9FAFB" : "#111827",
          maxHeight: "90vh",
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? "none" : "scale(0.95)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={`
              flex items-center justify-between
              mt-4
              px-6
              backdrop-blur-sm
            `}
            style={{
              borderColor: isDark ? "#374151" : "#E5E7EB",
              background: isDark
                ? "linear-gradient(to bottom, rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.6))"
                : "linear-gradient(to bottom, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.6))",
            }}
          >
            {title && <Text variant={variant} contentAlign='left' className={`modal-title`}>{title}</Text>}
            <div className="flex-1" />
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`
                  p-1
                  ${getBorderRadiusClass(branding.borderRadius)}
                  transition-all duration-200
                  ${isDark ? "hover:bg-gray-700 hover:shadow-lg" : "hover:bg-gray-100 hover:shadow-md"}
                `}                
                aria-label="Close modal"
              >
                <Icon data="IoCloseOutline" size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className="flex-1 overflow-y-auto px-6 pt-2 pb-4 custom-scrollbar"
          style={{
            color: isDark ? "#F9FAFB" : "#111827",
            overscrollBehavior: "contain",
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`
              px-6 py-4
              border-t
              ${isHighContrast ? 'border-t-2' : ''}
              flex items-center justify-end gap-3
              backdrop-blur-sm
            `}
            style={{
              borderColor: isDark ? "#374151" : "#E5E7EB",
              background: isDark
                ? "linear-gradient(to top, rgba(31, 41, 55, 0.8), rgba(31, 41, 55, 0.6))"
                : "linear-gradient(to top, rgba(249, 250, 251, 0.8), rgba(255, 255, 255, 0.6))",
            }}
          >
            {footer}
          </div>
        )}
      </div>
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

  const finalElement = renderWithHeader(modalElement);

  if (needTooltip && tooltipProps) {
    return (
      <Tooltip title={tooltipProps.title} placement={tooltipProps.placement}>
        {finalElement}
      </Tooltip>
    );
  }

  return <>{finalElement}</>;
};