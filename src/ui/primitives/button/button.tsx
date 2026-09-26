"use client";

import type { ReactNode } from "react";
import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type {
  ButtonIconName,
  ButtonIconProps,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
} from "./button.types";

// C01 MD: padding 12/36, 18 px line → 42 px high. Focus: 2 px ring, offset 2, plus the glow halo.
const BASE = [
  "inline-flex items-center justify-center gap-(--component-button-gap) whitespace-nowrap",
  "rounded-(--component-button-radius)",
  "text-(length:--font-size-body) leading-[18px] font-semibold",
  "outline-none transition-colors",
  "data-focus-visible:outline-2 data-focus-visible:outline-offset-2",
  "data-focus-visible:outline-(--color-semantic-focus-ring)",
  "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
];

const SIZES: Record<ButtonSize, string[]> = {
  md: ["px-(--component-button-md-padding-x) py-(--component-button-md-padding-y)"],
  lg: ["px-(--component-button-lg-padding-x) py-(--component-button-lg-padding-y)"],
};

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
  danger: [
    "bg-(--component-button-danger-background) text-(--component-button-danger-text)",
    "data-hovered:bg-(--component-button-danger-background-hover)",
    "data-pressed:bg-(--component-button-danger-background-hover)",
    "data-focus-visible:shadow-[0_0_0_4px_var(--color-semantic-focus-glow)]",
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
  size = "md",
  isDisabled,
  onPress,
  className,
  iconLeading,
  iconTrailing,
  children,
}: Readonly<ButtonProps>) {
  return (
    <AriaButton
      type={type}
      isDisabled={isDisabled}
      onPress={onPress}
      data-variant={variant}
      data-size={size}
      className={cn(BASE, SIZES[size], VARIANTS[variant], className)}
    >
      {iconLeading ? <ButtonIcon name={iconLeading} side="leading" /> : null}
      {children}
      {iconTrailing ? <ButtonIcon name={iconTrailing} side="trailing" /> : null}
    </AriaButton>
  );
}

const BUTTON_ICON_PATHS: Record<ButtonIconName, ReactNode> = {
  plus: (
    <>
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </>
  ),
  send: (
    <>
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  "arrow-right": (
    <>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </>
  ),
  "trash-2": (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="m19 6-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </>
  ),
};

function ButtonIcon({ name, side }: Readonly<ButtonIconProps>) {
  const common = {
    "aria-hidden": true,
    "data-testid": `button-icon-${side}`,
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return <svg {...common}>{BUTTON_ICON_PATHS[name]}</svg>;
}
