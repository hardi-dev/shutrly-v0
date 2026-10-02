import type { ReactNode } from "react";

import type { BreadcrumbItem, PageHeaderProps } from "../page-header/page-header.types";

export interface AppPanelProps {
  id?: string;
  title: string;
  parent?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  utilities?: ReactNode;
  subtitle?: string;
  actions?: ReactNode;
  tabs?: NonNullable<PageHeaderProps["tabs"]>;
  children: ReactNode;
}

export interface PageContentProps {
  children: ReactNode;
}
