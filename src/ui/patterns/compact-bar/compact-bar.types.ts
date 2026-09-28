import type { ReactNode } from "react";

export interface CompactBarProps {
  title: string;
  parent: { label: string; href: string };
  actions?: ReactNode;
}
