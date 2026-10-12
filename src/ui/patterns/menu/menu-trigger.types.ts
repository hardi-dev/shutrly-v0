import type { ReactNode } from "react";

export interface MenuTriggerProps {
  label: string;
  children: ReactNode;
  onOpenChange?: (isOpen: boolean) => void;
  /** Controls the open state when the caller closes the menu after an action. */
  isOpen?: boolean;
}
