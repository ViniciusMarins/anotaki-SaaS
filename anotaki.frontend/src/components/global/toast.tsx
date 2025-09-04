import type { ReactNode } from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";

export enum ToastTypes {
  error = "#fef2f2",
  success = "#f0fdf4",
  info = "#eff6ff",
  warning = "#fffbeb",
}

interface ToastProps extends Omit<ExternalToast, "style"> {
  message: string | ReactNode;
  type: keyof typeof ToastTypes;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  duration?: number;
}

export const customToast = {
  show: ({
    message,
    type,
    position = "top-right",
    duration = 5000,
    ...options
  }: ToastProps) => {
    const toastOptions: ExternalToast = {
      ...options,
      style: {
        backgroundColor: ToastTypes[type],
        border: `1px solid ${
          type === "error"
            ? "#fecaca"
            : type === "success"
            ? "#bbf7d0"
            : type === "warning"
            ? "#fed7aa"
            : "#dbeafe"
        }`,
        color:
          type === "error"
            ? "#991b1b"
            : type === "success"
            ? "#166534"
            : type === "warning"
            ? "#9a3412"
            : "#1e40af",
      },
      actionButtonStyle: {
        ...options.actionButtonStyle,
      },
      cancelButtonStyle: {
        ...options.cancelButtonStyle,
      },
      position,
      duration,
    };

    switch (type) {
      case "success":
        return sonnerToast.success(message, toastOptions);
      case "error":
        return sonnerToast.error(message, toastOptions);
      case "warning":
        return sonnerToast.warning(message, toastOptions);
      case "info":
      default:
        return sonnerToast.info(message, toastOptions);
    }
  },

  success: (
    message: string | ReactNode,
    options?: Omit<ToastProps, "message" | "type">
  ) => customToast.show({ message, type: "success", ...options }),

  error: (
    message: string | ReactNode,
    options?: Omit<ToastProps, "message" | "type">
  ) => customToast.show({ message, type: "error", ...options }),

  info: (
    message: string | ReactNode,
    options?: Omit<ToastProps, "message" | "type">
  ) => customToast.show({ message, type: "info", ...options }),

  warning: (
    message: string | ReactNode,
    options?: Omit<ToastProps, "message" | "type">
  ) => customToast.show({ message, type: "warning", ...options }),
};
