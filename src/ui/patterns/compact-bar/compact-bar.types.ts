import type { ReactNode } from "react";

export interface CompactBarProps {
  title: string;
  parent: { label: string; href: string };
  actions?: ReactNode;
}

export interface CompactBarFrameProps {
  children: ReactNode;
  actions?: ReactNode;
}

export interface CompactBarTitleProps {
  backLabel: string;
  title: string;
  parent: { label: string; href: string };
}
