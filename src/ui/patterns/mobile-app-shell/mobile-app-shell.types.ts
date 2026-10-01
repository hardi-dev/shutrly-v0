import type { ReactNode } from "react";

export interface MobileAppShellProps {
  workspace?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  bottomNav: ReactNode;
  actions?: ReactNode;
  sheet?: ReactNode;
  isOverlayOpen?: boolean;
  utilities?: ReactNode;
  onWorkspacePress?: () => void;
  /** Replaces the Mobile Header, e.g. with a Compact Bar on a sub-page (F-17). */
  header?: ReactNode;
}
