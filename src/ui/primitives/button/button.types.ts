import type { ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "md" | "lg";
export type ButtonIconName = "plus" | "send" | "chevron-down" | "arrow-right" | "trash-2";

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
