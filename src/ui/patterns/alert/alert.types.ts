import type { Ref } from "react";

export type AlertTone = "success" | "info" | "warning" | "danger" | "highlight";

export interface AlertProps {
  tone: AlertTone;
  title: string;
  body?: string;
  /** True when inserted as feedback (role alert/status); false for static guidance. */
  live?: boolean;
  onClose?: () => void;
  closeLabel?: string;
  titleId?: string;
  bodyId?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
  action?: { label: string; onAction: () => void };
}
