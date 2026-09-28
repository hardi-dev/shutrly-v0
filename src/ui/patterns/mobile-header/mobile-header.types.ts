import type { ReactNode } from "react";

export interface MobileHeaderProps {
  workspace: string;
  title: string;
  subtitle?: string;
  utilities: ReactNode;
  onWorkspacePress?: () => void;
}
