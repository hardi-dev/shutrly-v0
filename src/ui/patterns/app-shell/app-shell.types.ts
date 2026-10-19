import type { ReactNode } from "react";

import type { BottomNavProps } from "../bottom-nav/bottom-nav.types";
import type { CompactBarProps } from "../compact-bar/compact-bar.types";
import type { PageHeaderProps } from "../page-header/page-header.types";
import type {
  SidebarAccount,
  SidebarAccountMenu,
  SidebarWorkspace,
} from "../sidebar/sidebar.types";

export interface AppShellSubPage {
  parent: CompactBarProps["parent"];
  /** Hides the phone Bottom Nav, e.g. when a sticky action bar takes its place. */
  hidesBottomNav?: boolean;
}

export interface AppShellProps {
  title: string;
  subtitle?: string;
  mobileSubtitle?: string;
  workspace: SidebarWorkspace;
  account: SidebarAccount;
  onLogout?: () => void;
  accountMenu?: SidebarAccountMenu;
  children: ReactNode;
  nav: ReactNode;
  navBottom?: ReactNode;
  panelActions?: ReactNode;
  panelUtilities?: ReactNode;
  panelTabs?: NonNullable<PageHeaderProps["tabs"]>;
  panelBreadcrumbs?: NonNullable<PageHeaderProps["breadcrumbs"]>;
  /** A trail rendered on the server (ADR-026); wins over `panelBreadcrumbs`. */
  panelTrail?: ReactNode;
  mobileBottomNav: BottomNavProps;
  mobileSheet?: ReactNode;
  mobileUtilities?: ReactNode;
  onMobileWorkspacePress?: () => void;
  isMobileOverlayOpen?: boolean;
  onLayoutChange?: () => void;
  workspaceSwitcher?: ReactNode | ((isCompact: boolean) => ReactNode);
  subPage?: AppShellSubPage;
  /** The page heading rendered on the server (`@heading` slot): replaces the title, status, meta and the phone compact bar title. */
  heading?: ReactNode;
  /** Hides the phone Bottom Nav on a page with its own sticky action bar. */
  hidesBottomNav?: boolean;
}
