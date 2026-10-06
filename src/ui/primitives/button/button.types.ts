import type { ReactNode } from "react";

import type { IconName } from "../icon/icon.types";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "md" | "lg";
export type ButtonIconName = Extract<
  IconName,
  | "plus"
  | "send"
  | "chevron-down"
  | "arrow-right"
  | "trash-2"
  | "rotate-ccw"
  | "pencil"
  | "archive"
  | "archive-restore"
  | "calendar-check"
  | "camera"
  | "circle-check-big"
  | "refresh-cw"
  | "copy"
  | "images"
  | "download"
  | "arrow-left"
  | "external-link"
  | "user-round-cog"
  | "user-plus"
  // F-10 viewer: *Pilih untuk…* and *Catatan* (pratinjau exports).
  | "list-checks"
  | "message-square-text"
>;

export interface ButtonIconProps {
  name: ButtonIconName;
  side: "leading" | "trailing";
}

export interface ButtonProps {
  type?: "button" | "submit";
  variant?: ButtonVariant;
  size?: ButtonSize;
  isDisabled?: boolean;
  isPending?: boolean;
  form?: string;
  id?: string;
  onPress?: () => void;
  className?: string;
  "aria-label"?: string;
  iconLeading?: ButtonIconName;
  iconTrailing?: ButtonIconName;
  /** Renders the button as a link with the same look, e.g. *Buka di Google Drive*. */
  href?: string;
  target?: "_blank";
  children: ReactNode;
}
