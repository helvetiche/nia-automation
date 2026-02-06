"use client";

import { useEffect, useRef, useCallback } from "react";
import { gsap } from "gsap";
import {
  CheckCircle,
  Warning,
  XCircle,
  X,
} from "@phosphor-icons/react/dist/ssr";

export type ToastType = "success" | "warning" | "error" | "info";

interface ToastProps {
  type: ToastType;
  title: string;
  description?: string;
  onClose: () => void;
  duration?: number;
}

const TOAST_CONFIG = {
  success: {
    icon: CheckCircle,
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    iconColor: "text-emerald-600",
    titleColor: "text-emerald-900",
  },
  warning: {
    icon: Warning,
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    iconColor: "text-yellow-600",
    titleColor: "text-yellow-900",
  },
  error: {
    icon: XCircle,
    bgColor: "bg-red-50",
    borderColor: "border-red-200",
    iconColor: "text-red-600",
    titleColor: "text-red-900",
  },
  info: {
    icon: CheckCircle,
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    iconColor: "text-blue-600",
    titleColor: "text-blue-900",
  },
};

export default function Toast({
  type,
  title,
  description,
  onClose,
  duration = 4000,
}: ToastProps) {
  const toastRef = useRef<HTMLDivElement>(null);
  const config = TOAST_CONFIG[type];
  const IconComponent = config?.icon;

  const closeToast = useCallback(() => {
    if (!toastRef.current || !config) return;

    gsap.to(toastRef.current, {
      opacity: 0,
      x: 100,
      scale: 0.9,
      duration: 0.3,
      ease: "power2.in",
      onComplete: onClose,
    });
  }, [onClose, config]);

  useEffect(() => {
    if (!toastRef.current || !config) return;

    gsap.fromTo(
      toastRef.current,
      {
        opacity: 0,
        x: 100,
        scale: 0.9,
      },
      {
        opacity: 1,
        x: 0,
        scale: 1,
        duration: 0.4,
        ease: "power3.out",
      },
    );

    const timer = setTimeout(() => {
      closeToast();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, closeToast, config]);

  if (!config || !IconComponent) {
    return null;
  }

  return (
    <div
      ref={toastRef}
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg ${config.bgColor} ${config.borderColor} min-w-[320px] max-w-md`}
    >
      <IconComponent
        weight="regular"
        className={`w-6 h-6 ${config.iconColor} flex-shrink-0 mt-0.5`}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${config.titleColor}`}>{title}</p>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </div>
      <button
        onClick={closeToast}
        className="p-1 hover:bg-black/5 rounded transition flex-shrink-0"
      >
        <X weight="regular" className="w-4 h-4 text-gray-500" />
      </button>
    </div>
  );
}
