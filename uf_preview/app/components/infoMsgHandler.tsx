"use client";

import { useCallback } from "react";

type ToastType = "success" | "danger" | "info" | "warning";

export type TextVariant =
  | 'display-4'
  | 'display-3'
  | 'display-2'
  | 'display-1'
  | 'header-2'
  | 'header-1'
  | 'subheader-3'
  | 'subheader-2'
  | 'subheader-1'
  | 'body-3'
  | 'body-2'
  | 'body-1'
  | 'body-short'
  | 'caption-2'
  | 'caption-1'
  | 'code-3'
  | 'code-inline-3'
  | 'code-2'
  | 'code-inline-2'
  | 'code-1'
  | 'code-inline-1'

interface ToastConfig {
  message: string;
  type: ToastType;
  duration?: number;
  variant?: TextVariant;
}

export const useInfoMsg = () => {
  // Mirrors UF/components/Text.tsx's getVariantClasses exactly — same clamp() breakpoints,
  // same font-weight/opacity/font-family per variant. `box` reuses that identical clamp()
  // expression as a width/height class, so the icon and close button are always pixel-for-pixel
  // the same size as the title, per variant, at every viewport width — no separate size table.
  const getVariantClasses = (variant?: TextVariant): { title: string; message: string; box: string } => {
    if (!variant) {
      return { title: 'font-bold text-sm', message: 'text-sm opacity-90', box: 'w-4 h-4 text-sm' };
    }
    switch (variant) {
      case 'display-4':
        return { title: 'text-[clamp(30px,4.167vw,60px)] font-bold', message: 'text-[clamp(30px,4.167vw,60px)]', box: 'w-[clamp(30px,4.167vw,60px)] h-[clamp(30px,4.167vw,60px)] text-[clamp(30px,4.167vw,60px)]' };
      case 'display-3':
        return { title: 'text-[clamp(24px,3.333vw,48px)] font-bold', message: 'text-[clamp(24px,3.333vw,48px)]', box: 'w-[clamp(24px,3.333vw,48px)] h-[clamp(24px,3.333vw,48px)] text-[clamp(24px,3.333vw,48px)]' };
      case 'display-2':
        return { title: 'text-[clamp(20px,2.5vw,36px)] font-bold', message: 'text-[clamp(20px,2.5vw,36px)]', box: 'w-[clamp(20px,2.5vw,36px)] h-[clamp(20px,2.5vw,36px)] text-[clamp(20px,2.5vw,36px)]' };
      case 'display-1':
        return { title: 'text-[clamp(18px,2.083vw,30px)] font-bold', message: 'text-[clamp(18px,2.083vw,30px)]', box: 'w-[clamp(18px,2.083vw,30px)] h-[clamp(18px,2.083vw,30px)] text-[clamp(18px,2.083vw,30px)]' };
      case 'header-2':
        return { title: 'text-[clamp(16px,1.667vw,24px)] font-semibold', message: 'text-[clamp(16px,1.667vw,24px)]', box: 'w-[clamp(16px,1.667vw,24px)] h-[clamp(16px,1.667vw,24px)] text-[clamp(16px,1.667vw,24px)]' };
      case 'header-1':
        return { title: 'text-[clamp(14px,1.389vw,20px)] font-semibold', message: 'text-[clamp(14px,1.389vw,20px)]', box: 'w-[clamp(14px,1.389vw,20px)] h-[clamp(14px,1.389vw,20px)] text-[clamp(14px,1.389vw,20px)]' };
      case 'subheader-3':
        return { title: 'text-[clamp(13px,1.25vw,18px)] font-medium', message: 'text-[clamp(13px,1.25vw,18px)]', box: 'w-[clamp(13px,1.25vw,18px)] h-[clamp(13px,1.25vw,18px)] text-[clamp(13px,1.25vw,18px)]' };
      case 'subheader-2':
        return { title: 'text-[clamp(12px,1.111vw,16px)] font-medium', message: 'text-[clamp(12px,1.111vw,16px)]', box: 'w-[clamp(12px,1.111vw,16px)] h-[clamp(12px,1.111vw,16px)] text-[clamp(12px,1.111vw,16px)]' };
      case 'subheader-1':
        return { title: 'text-[clamp(11px,0.972vw,14px)] font-medium', message: 'text-[clamp(11px,0.972vw,14px)]', box: 'w-[clamp(11px,0.972vw,14px)] h-[clamp(11px,0.972vw,14px)] text-[clamp(11px,0.972vw,14px)]' };
      case 'body-3':
        return { title: 'text-[clamp(13px,1.25vw,18px)]', message: 'text-[clamp(13px,1.25vw,18px)]', box: 'w-[clamp(13px,1.25vw,18px)] h-[clamp(13px,1.25vw,18px)] text-[clamp(13px,1.25vw,18px)]' };
      case 'body-2':
        return { title: 'text-[clamp(12px,1.111vw,16px)]', message: 'text-[clamp(12px,1.111vw,16px)]', box: 'w-[clamp(12px,1.111vw,16px)] h-[clamp(12px,1.111vw,16px)] text-[clamp(12px,1.111vw,16px)]' };
      case 'body-1':
        return { title: 'text-[clamp(11px,0.972vw,14px)]', message: 'text-[clamp(11px,0.972vw,14px)]', box: 'w-[clamp(11px,0.972vw,14px)] h-[clamp(11px,0.972vw,14px)] text-[clamp(11px,0.972vw,14px)]' };
      case 'body-short':
        return { title: 'text-[clamp(11px,0.972vw,14px)]', message: 'text-[clamp(11px,0.972vw,14px)]', box: 'w-[clamp(11px,0.972vw,14px)] h-[clamp(11px,0.972vw,14px)] text-[clamp(11px,0.972vw,14px)]' };
      case 'caption-2':
        return { title: 'text-[clamp(10px,0.833vw,12px)]', message: 'text-[clamp(10px,0.833vw,12px)]', box: 'w-[clamp(10px,0.833vw,12px)] h-[clamp(10px,0.833vw,12px)] text-[clamp(10px,0.833vw,12px)]' };
      case 'caption-1':
        return { title: 'text-[clamp(10px,0.833vw,12px)] opacity-75', message: 'text-[clamp(10px,0.833vw,12px)] opacity-75', box: 'w-[clamp(10px,0.833vw,12px)] h-[clamp(10px,0.833vw,12px)] text-[clamp(10px,0.833vw,12px)]' };
      case 'code-3':
      case 'code-inline-3':
        return { title: 'text-[clamp(13px,1.25vw,18px)] font-mono', message: 'text-[clamp(13px,1.25vw,18px)] font-mono', box: 'w-[clamp(13px,1.25vw,18px)] h-[clamp(13px,1.25vw,18px)] text-[clamp(13px,1.25vw,18px)]' };
      case 'code-2':
      case 'code-inline-2':
        return { title: 'text-[clamp(12px,1.111vw,16px)] font-mono', message: 'text-[clamp(12px,1.111vw,16px)] font-mono', box: 'w-[clamp(12px,1.111vw,16px)] h-[clamp(12px,1.111vw,16px)] text-[clamp(12px,1.111vw,16px)]' };
      case 'code-1':
      case 'code-inline-1':
        return { title: 'text-[clamp(11px,0.972vw,14px)] font-mono', message: 'text-[clamp(11px,0.972vw,14px)] font-mono', box: 'w-[clamp(11px,0.972vw,14px)] h-[clamp(11px,0.972vw,14px)] text-[clamp(11px,0.972vw,14px)]' };
      default:
        return { title: 'text-[clamp(12px,1.111vw,16px)]', message: 'text-[clamp(12px,1.111vw,16px)]', box: 'w-[clamp(12px,1.111vw,16px)] h-[clamp(12px,1.111vw,16px)] text-[clamp(12px,1.111vw,16px)]' };
    }
  };

  const showToast = useCallback(
    (
      message: string | string[],
      type: ToastType,
      autoClose: boolean = true,
      variant?: TextVariant
    ) => {
      if (Array.isArray(message)) {
        message.forEach((msg) => showToast(msg, type, autoClose, variant));
        return;
      }

      // Create toast container if it doesn't exist
      let container = document.getElementById("toast-container");
      if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.className =
          "fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none";
        document.body.appendChild(container);
      }

      // Create toast element
      const toast = document.createElement("div");
      toast.className = "pointer-events-auto animate-slideInRight";

      // Get colors and icons based on type
      const getToastStyles = (toastType: ToastType) => {
        switch (toastType) {
          case "success":
            return {
              bg: "bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700",
              icon: "✓",
              title: "Success",
            };
          case "danger":
            return {
              bg: "bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-600 dark:to-rose-700",
              icon: "✕",
              title: "Error",
            };
          case "info":
            return {
              bg: "bg-gradient-to-r from-blue-500 to-cyan-600 dark:from-blue-600 dark:to-cyan-700",
              icon: "ℹ",
              title: "Info",
            };
          case "warning":
            return {
              bg: "bg-gradient-to-r from-yellow-500 to-orange-600 dark:from-yellow-600 dark:to-orange-700",
              icon: "⚠",
              title: "Warning",
            };
          default:
            return {
              bg: "bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700",
              icon: "ℹ",
              title: "Info",
            };
        }
      };

      const styles = getToastStyles(type);
      const variantClasses = getVariantClasses(variant);

      const msgAlignment = (msg: string) => {
        if (msg.includes("\n")) {
          return msg
            .split("\n")
            .map((line) => `<div>${line}</div>`)
            .join("");
        }
        return msg;
      };

      toast.innerHTML = `
        <div class="flex flex-col gap-1 ${styles.bg} text-white px-4 py-3 rounded-lg shadow-lg min-w-[300px] max-w-[400px] backdrop-blur-sm border border-white/20">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0 ${variantClasses.box} flex items-center justify-center rounded-full bg-white/20">
              <span class="font-bold text-[0.55em] leading-none">${styles.icon}</span>
            </div>
            <div class="flex-1 min-w-0 ${variantClasses.title}">${styles.title}</div>
            <button class="toast-close flex-shrink-0 ${variantClasses.box} flex items-center justify-center rounded hover:bg-white/20 transition-colors">
              <span class="text-[0.65em] leading-none">×</span>
            </button>
          </div>
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0 ${variantClasses.box}"></div>
            <div class="flex-1 min-w-0 ${variantClasses.message} break-words">
              ${msgAlignment(message)}
            </div>
          </div>
        </div>
      `;

      container.appendChild(toast);

      const closeBtn = toast.querySelector(".toast-close");

      let timeoutId: ReturnType<typeof setTimeout> | null = null;
      let isRemoving = false;

      const startTimer = () => {
        if (!autoClose || isRemoving) return;

        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        timeoutId = setTimeout(() => {
          removeToast();
        }, 5000);
      };

      const stopTimer = () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
      };

      const removeToast = () => {
        if (isRemoving) return;
        isRemoving = true;

        stopTimer();

        toast.removeEventListener("mouseenter", stopTimer);
        toast.removeEventListener("mouseleave", startTimer);
        closeBtn?.removeEventListener("click", removeToast);

        toast.style.animation = "slideOutRight 0.3s ease-out";

        setTimeout(() => {
          toast.remove();

          if (container && container.children.length === 0) {
            container.remove();
          }
        }, 300);
      };

      closeBtn?.addEventListener("click", removeToast);

      if (autoClose) {
        // Start initial timer
        startTimer();

        // Pause timer while hovering
        toast.addEventListener("mouseenter", stopTimer);

        // Restart full 5-second timer after leaving
        toast.addEventListener("mouseleave", startTimer);
      }
    },
    []
  );

  return showToast;
};

// Add CSS animations to global styles if not already present
if (
  typeof window !== "undefined" &&
  !document.getElementById("toast-animations")
) {
  const style = document.createElement("style");
  style.id = "toast-animations";
  style.innerHTML = `
    @keyframes slideInRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @keyframes slideOutRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }

    .animate-slideInRight {
      animation: slideInRight 0.3s ease-out;
    }
  `;

  document.head.appendChild(style);
}