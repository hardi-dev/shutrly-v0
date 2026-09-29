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
  isCompact?: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
  onLogout?: () => void;
  workspaceSwitcher?: ReactNode | ((isCompact: boolean) => ReactNode);
}

export interface SidebarWorkspaceTriggerProps {
  workspaceName: string;
  isCompact?: boolean;
  onPress?: () => void;
}
