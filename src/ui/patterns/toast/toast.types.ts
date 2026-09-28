import type { QueuedToast, ToastState } from "@react-stately/toast";

import type { AlertTone } from "../alert/alert.types";

export interface ToastContent {
  tone: AlertTone;
  title: string;
  body?: string;
  closeLabel?: string;
  action?: { label: string; onAction: () => void };
}

export interface ToastOptions {
  timeout?: number;
  onClose?: () => void;
}

export interface ToastRegionProps {
  ariaLabel?: string;
}

export interface ToastOnMountProps {
  tone: AlertTone;
  title: string;
  body?: string;
  dedupeKey?: string;
}

export interface ToastItemProps {
  toast: QueuedToast<ToastContent>;
  state: ToastState<ToastContent>;
}
