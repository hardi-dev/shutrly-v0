import type { BreadcrumbItem } from "@/ui/patterns/page-header/page-header.types";
import type { TabLink } from "@/ui/patterns/tabs/tabs.types";

export interface OwnerNavProps {
  workspaceId: string;
  pathname: string;
}

export type OwnerNavKey =
  "dashboard" | "projects" | "clients" | "invoices" | "services" | "settings" | null;
export type OwnerPhoneTab = "dashboard" | "projects" | "clients" | "invoices" | null;
export interface ActiveNavState {
  nav: OwnerNavKey;
  tab: OwnerPhoneTab;
}

export interface PageHeading {
  title: string;
  subtitle?: string;
  breadcrumbs?: readonly BreadcrumbItem[];
  tabs?: {
    readonly label: string;
    readonly tabs: readonly TabLink[];
  };
}
