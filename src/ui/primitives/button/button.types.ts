import type { ReactNode } from "react";
export type ButtonVariant = "primary" | "secondary";
export interface ButtonProps {
  type?: "button" | "submit";
  variant?: ButtonVariant;
  isDisabled?: boolean;
  onPress?: () => void;
  className?: string;
  children: ReactNode;
}
