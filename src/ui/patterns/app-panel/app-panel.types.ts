import type { ReactNode } from "react";

import type { BreadcrumbItem, PageHeaderProps } from "../page-header/page-header.types";

export interface AppPanelProps {
  id?: string;
  title: string;
  parent?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  utilities?: ReactNode;
  subtitle?: string;
  titleAdornment?: ReactNode;
  meta?: string;
  actions?: ReactNode;
  tabs?: NonNullable<PageHeaderProps["tabs"]>;
  trail?: ReactNode;
  /** Sits left of the breadcrumb, e.g. the sidebar toggle (F-23). */
  leading?: ReactNode;
  children: ReactNode;
}

export interface PageContentProps {
  children: ReactNode;
}
