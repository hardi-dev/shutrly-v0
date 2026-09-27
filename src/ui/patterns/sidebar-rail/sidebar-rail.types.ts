import type { ReactNode } from "react";

import type { SidebarAccount, SidebarWorkspace } from "../sidebar/sidebar.types";

export interface SidebarRailProps {
  workspace: SidebarWorkspace;
  account: SidebarAccount;
  children: ReactNode;
  navBottom?: ReactNode;
  onExpand?: () => void;
}
