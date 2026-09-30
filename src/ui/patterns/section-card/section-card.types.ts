import type { ReactNode } from "react";

export type SectionCardContent = "padded" | "flush" | "bleed";

export interface SectionCardProps {
  title?: string;
  description?: string;
  actions?: ReactNode;
  content?: SectionCardContent;
  "aria-label"?: string;
  className?: string;
  children: ReactNode;
}
