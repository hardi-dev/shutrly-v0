import type { ReactNode } from "react";

export interface AppPanelProps {
  title: string;
  parent?: string;
  utilities?: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}

export interface PageContentProps {
  children: ReactNode;
}
