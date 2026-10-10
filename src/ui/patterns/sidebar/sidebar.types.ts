import type { ReactNode } from "react";

export interface SidebarWorkspace {
  name: string;
}

export interface SidebarAccount {
  name: string;
  email: string;
  initials: string;
}

/** Renders an account menu around the account block trigger it receives. */
export type SidebarAccountMenu = (trigger: ReactNode) => ReactNode;

export interface SidebarProps {
  workspace: SidebarWorkspace;
  account: SidebarAccount;
  children: ReactNode;
  navBottom?: ReactNode;
  isCompact?: boolean;
  onCollapse?: () => void;
  onExpand?: () => void;
  onLogout?: () => void;
  /** Wraps the account block as the trigger of an account menu; replaces the log-out button. */
  accountMenu?: SidebarAccountMenu;
  workspaceSwitcher?: ReactNode | ((isCompact: boolean) => ReactNode);
}

export interface SidebarWorkspaceTriggerProps {
  workspaceName: string;
  isCompact?: boolean;
  onPress?: () => void;
}
