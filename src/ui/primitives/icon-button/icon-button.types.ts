import type { IconName } from "../icon/icon.types";

export type IconButtonSize = "sm" | "md";

export interface IconButtonProps {
  icon: IconName;
  size?: IconButtonSize;
  id?: string;
  "aria-label": string;
  onPress?: () => void;
  isDisabled?: boolean;
  className?: string;
  badgeCount?: number;
  /** The words after the count in the accessible name; default "belum dibaca" (notifications). */
  badgeLabel?: string;
  "data-client-row-action"?: string;
}
