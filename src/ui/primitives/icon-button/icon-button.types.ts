import type { IconName } from "../icon/icon.types";

export type IconButtonSize = "sm" | "md";
/** `danger` colours the icon for destructive row actions such as removing a team member (F-08 D-16). */
export type IconButtonTone = "default" | "danger";

export interface IconButtonProps {
  icon: IconName;
  size?: IconButtonSize;
  tone?: IconButtonTone;
  id?: string;
  "aria-label": string;
  onPress?: () => void;
  isDisabled?: boolean;
  className?: string;
  badgeCount?: number;
  /** Words after the count in the accessible name. Omit to use the localized unread-notifications copy. */
  badgeLabel?: string;
  "data-client-row-action"?: string;
  /** Renders the icon button as a link, e.g. *Buka di Drive* on phones (F-09). */
  href?: string;
  target?: "_blank";
}
