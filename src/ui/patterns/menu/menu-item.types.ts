import type { IconName } from "@/ui/primitives/icon/icon.types";

export type MenuItemVariant = "default" | "destructive";

export interface MenuItemProps {
  label: string;
  description?: string;
  icon?: IconName;
  isSelected?: boolean;
  isDisabled?: boolean;
  variant?: MenuItemVariant;
  onSelect: () => void;
}
