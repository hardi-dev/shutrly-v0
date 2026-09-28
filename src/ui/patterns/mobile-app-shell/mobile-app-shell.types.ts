import type { ReactNode } from "react";

export interface MobileAppShellProps {
  workspace?: string;
  title: string;
  children: ReactNode;
  bottomNav: ReactNode;
  actions?: ReactNode;
  sheet?: ReactNode;
  isOverlayOpen?: boolean;
  utilities?: ReactNode;
  onWorkspacePress?: () => void;
}
