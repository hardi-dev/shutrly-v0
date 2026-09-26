"use client";

import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { ButtonProps, ButtonVariant } from "./button.types";

// C01 MD: padding 12/36, 18 px line → 42 px high. Focus: 2 px ring, offset 2, plus the glow halo.
const BASE = [
  "inline-flex items-center justify-center gap-(--component-button-gap) whitespace-nowrap",
  "rounded-(--component-button-radius)",
  "px-(--component-button-md-padding-x) py-(--component-button-md-padding-y)",
  "text-(length:--font-size-body) leading-[18px] font-semibold",
  "outline-none transition-colors",
  "data-focus-visible:outline-2 data-focus-visible:outline-offset-2",
  "data-focus-visible:outline-(--color-semantic-focus-ring)",
  "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
];

// Secondary draws its 1 px border as an inset shadow so both variants stay 42 px high.
const VARIANTS: Record<ButtonVariant, string[]> = {
  primary: [
    "bg-(--component-button-primary-background) text-(--component-button-primary-text)",
    "data-hovered:bg-(--component-button-primary-background-hover)",
    "data-pressed:bg-(--component-button-primary-background-hover)",
    "data-focus-visible:shadow-[0_0_0_4px_var(--color-semantic-focus-glow)]",
  ],
  secondary: [
    "bg-(--component-button-secondary-background) text-(--component-button-secondary-text)",
    "shadow-[inset_0_0_0_1px_var(--component-button-secondary-border)]",
    "data-hovered:bg-(--component-button-secondary-background-hover)",
    "data-pressed:bg-(--component-button-secondary-background-hover)",
    "data-focus-visible:shadow-[inset_0_0_0_1px_var(--component-button-secondary-border),0_0_0_4px_var(--color-semantic-focus-glow)]",
  ],
};

/**
 * Design-system button (C01, MD) on React Aria: press, keyboard and focus-visible handling.
 * @param props - `type` defaults to `"button"` and `variant` to `"primary"`
 * @returns the styled button
 */
export function Button({
  type = "button",
  variant = "primary",
  isDisabled,
  onPress,
  className,
  children,
}: Readonly<ButtonProps>) {
  return (
    <AriaButton
      type={type}
      isDisabled={isDisabled}
      onPress={onPress}
      className={cn(BASE, VARIANTS[variant], className)}
    >
      {children}
    </AriaButton>
  );
}
