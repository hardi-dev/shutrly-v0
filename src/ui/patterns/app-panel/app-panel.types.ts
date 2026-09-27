import type { ReactNode } from "react";

export interface AppPanelProps {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
}

export interface PageContentProps {
  children: ReactNode;
}
