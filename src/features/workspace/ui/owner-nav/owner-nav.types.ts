export interface OwnerNavProps {
  workspaceId: string;
  pathname: string;
}

export type OwnerNavKey = "dashboard" | "projects" | "clients" | "invoices" | "settings" | null;
export type OwnerPhoneTab = "dashboard" | "projects" | "clients" | "invoices" | null;
export interface ActiveNavState {
  nav: OwnerNavKey;
  tab: OwnerPhoneTab;
}
