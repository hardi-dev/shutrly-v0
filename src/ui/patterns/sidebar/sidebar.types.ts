import type { ReactNode } from "react";

export interface SidebarWorkspace {
  name: string;
}

export interface SidebarAccount {
  name: string;
  email: string;
  initials: string;
}

export interface SidebarProps {
  workspace: SidebarWorkspace;
  account: SidebarAccount;
  children: ReactNode;
  navBottom?: ReactNode;
  onCollapse?: () => void;
  onLogout?: () => void;
}
