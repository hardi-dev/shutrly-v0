import type { IconName } from "@/ui/primitives/icon/icon.types";

export type MenuItemVariant = "default" | "destructive";

/** `row` mirrors the Bottom Sheet row (C32) so a list reads the same on every layout. */
export type MenuItemLayout = "compact" | "row";

export interface MenuItemProps {
  label: string;
  description?: string;
  icon?: IconName;
  isSelected?: boolean;
  isDisabled?: boolean;
  variant?: MenuItemVariant;
  layout?: MenuItemLayout;
  href?: string;
  target?: "_blank";
  onSelect?: () => void;
}
