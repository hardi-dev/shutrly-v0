import type { ReactNode } from "react";

import type { TabLink } from "../tabs/tabs.types";

export interface PageHeaderProps {
  parent: string;
  current: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  utilities?: ReactNode;
  tabs?: { readonly label: string; readonly tabs: readonly TabLink[] };
}
