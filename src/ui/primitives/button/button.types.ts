import type { ReactNode } from "react";

import type { IconName } from "../icon/icon.types";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "md" | "lg";
export type ButtonIconName = Extract<
  IconName,
  "plus" | "send" | "chevron-down" | "arrow-right" | "trash-2"
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
  onPress?: () => void;
  className?: string;
  iconLeading?: ButtonIconName;
  iconTrailing?: ButtonIconName;
  children: ReactNode;
}
