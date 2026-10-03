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
  children: ReactNode;
}
