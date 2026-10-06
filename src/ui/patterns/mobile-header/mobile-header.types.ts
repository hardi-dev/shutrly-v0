import type { ReactNode } from "react";

export interface MobileHeaderProps {
  /** The workspace pill; omitted on public pages such as the client gallery (F-10). */
  workspace?: string;
  title: string;
  subtitle?: string;
  utilities?: ReactNode;
  /** Replaces the workspace pill, e.g. a *Beranda* back link (F-10 A-26). */
  leading?: ReactNode;
  onWorkspacePress?: () => void;
}
