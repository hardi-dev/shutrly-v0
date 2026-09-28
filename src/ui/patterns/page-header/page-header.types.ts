import type { ReactNode } from "react";

export interface PageHeaderProps {
  parent: string;
  current: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  utilities?: ReactNode;
}
