import type { ReactNode } from "react";

export interface MobileAppShellProps {
  title: string;
  children: ReactNode;
  bottomNav: ReactNode;
  actions?: ReactNode;
  sheet?: ReactNode;
  isOverlayOpen?: boolean;
}
