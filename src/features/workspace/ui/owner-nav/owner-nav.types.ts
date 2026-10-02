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
  tabs?: {
    readonly label: string;
    readonly tabs: readonly TabLink[];
  };
}
import type { TabLink } from "@/ui/patterns/tabs/tabs.types";
