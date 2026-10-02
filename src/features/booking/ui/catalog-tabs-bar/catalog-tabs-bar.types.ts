import type { ReactNode } from "react";

export interface CatalogTabsBarProps {
  readonly workspaceId: string;
  readonly activeTab: "services" | "categories" | "items";
  readonly action?: ReactNode;
}
