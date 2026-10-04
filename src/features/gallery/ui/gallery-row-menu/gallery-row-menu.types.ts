import type { IconName } from "@/ui/primitives/icon/icon.types";

export interface GalleryMenuEntry {
  readonly label: string;
  readonly icon: IconName;
  readonly isDestructive?: boolean;
  readonly isDisabled?: boolean;
  /** The hint under a disabled entry (e.g. why *Lepas folder* is off). */
  readonly description?: string;
  readonly onSelect: () => void;
}

export interface GalleryRowMenuProps {
  readonly label: string;
  /** The phone sheet's title. */
  readonly title: string;
  readonly entries: readonly GalleryMenuEntry[];
  readonly size?: "sm" | "md";
}

export interface MobileEntryProps {
  readonly entry: GalleryMenuEntry;
  readonly onDone: (isOpen: boolean) => void;
}
