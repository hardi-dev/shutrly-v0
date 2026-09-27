import type { IconName } from "@/ui/primitives/icon/icon.types";

export type SheetItemVariant = "default" | "destructive";

export interface SheetItemProps {
  label: string;
  icon: IconName;
  count?: number;
  variant?: SheetItemVariant;
  onPress: () => void;
}
