import type { Ref } from "react";

export type AlertTone = "info" | "danger";

export interface AlertProps {
  tone: AlertTone;
  title: string;
  body?: string;
  /** True when inserted as feedback (role alert/status); false for static guidance. */
  live?: boolean;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}
