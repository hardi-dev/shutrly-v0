import type { IconName } from "@/ui/primitives/icon/icon.types";

export type SheetItemVariant = "default" | "destructive";

export interface SheetItemProps {
  label: string;
  icon?: IconName;
  count?: number;
  isSelected?: boolean;
  isDisabled?: boolean;
  variant?: SheetItemVariant;
  onPress: () => void;
}
