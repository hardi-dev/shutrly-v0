import type { ReactNode } from "react";

export interface MenuTriggerProps {
  label: string;
  children: ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
}
