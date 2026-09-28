import type { ReactNode } from "react";

import type { BottomNavProps } from "../bottom-nav/bottom-nav.types";
import type { SidebarAccount, SidebarWorkspace } from "../sidebar/sidebar.types";

export interface AppShellProps {
  title: string;
  workspace: SidebarWorkspace;
  account: SidebarAccount;
  onLogout?: () => void;
  children: ReactNode;
  nav: ReactNode;
  navBottom?: ReactNode;
  panelActions?: ReactNode;
  mobileBottomNav: BottomNavProps;
  mobileSheet?: ReactNode;
  mobileUtilities?: ReactNode;
  onMobileWorkspacePress?: () => void;
  isMobileOverlayOpen?: boolean;
  workspaceSwitcher?: ReactNode | ((isCompact: boolean) => ReactNode);
}
