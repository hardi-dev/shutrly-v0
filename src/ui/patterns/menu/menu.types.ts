import type { ReactNode } from "react";

export interface MenuProps {
  children: ReactNode;
  "aria-label": string;
  variant?: "default" | "list";
  footer?: ReactNode;
}
