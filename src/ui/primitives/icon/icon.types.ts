import type { HugeiconsIconProps } from "@hugeicons/react";

export type IconName =
  | "search"
  | "chevron-down"
  | "calendar"
  | "eye"
  | "eye-off"
  | "circle-alert"
  | "plus"
  | "send"
  | "arrow-right"
  | "trash-2";

export type IconSize = "sm" | "md";

export interface IconProps extends Omit<HugeiconsIconProps, "icon" | "size"> {
  name: IconName;
  size?: IconSize;
}
