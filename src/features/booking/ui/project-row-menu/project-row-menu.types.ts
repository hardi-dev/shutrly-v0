import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface RowMenuEntry {
  readonly label: string;
  readonly icon: IconName;
  readonly isDestructive?: boolean;
  readonly onSelect: () => void;
}
