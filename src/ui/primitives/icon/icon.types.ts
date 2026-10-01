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
  | "trash-2"
  | "info"
  | "google"
  | "camera"
  | "chevrons-up-down"
  | "layout-grid"
  | "folder-kanban"
  | "users"
  | "receipt"
  | "package"
  | "user-round-cog"
  | "message-square-text"
  | "share-2"
  | "settings"
  | "menu"
  | "check"
  | "chevron-right"
  | "search-x"
  | "panel-left"
  | "panel-left-open"
  | "log-out"
  | "x"
  | "loading-03"
  | "bell"
  | "chevron-left"
  | "aperture"
  | "image"
  | "hourglass"
  | "package-check"
  | "wallet"
  | "rotate-ccw"
  | "braces"
  | "pencil";

export type IconSize = "sm" | "md" | "lg";

export interface IconProps extends Omit<HugeiconsIconProps, "icon" | "size"> {
  name: IconName;
  size?: IconSize;
}
