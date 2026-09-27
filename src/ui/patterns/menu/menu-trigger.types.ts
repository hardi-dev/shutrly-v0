import type { ReactNode } from "react";

export interface MenuTriggerProps {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}
