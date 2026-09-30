"use client";

import { Button as AriaButton } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import { Icon } from "../icon/icon";
import type { ButtonIconProps, ButtonProps, ButtonSize, ButtonVariant } from "./button.types";

// C01 MD: padding 12/36, 18 px line → 42 px high. Focus: 2 px ring, offset 2, plus the glow halo.
const BASE = [
  "inline-flex items-center justify-center gap-(--component-button-gap) whitespace-nowrap",
  "rounded-(--component-button-radius)",
  "text-(length:--font-size-body) leading-[18px] font-semibold",
  "outline-none transition-colors",
  "data-focus-visible:outline-2 data-focus-visible:outline-offset-2",
  "data-focus-visible:outline-(--color-semantic-focus-ring)",
  "data-disabled:cursor-not-allowed data-disabled:opacity-(--opacity-disabled)",
  "data-pending:cursor-not-allowed data-pending:opacity-(--opacity-disabled)",
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
  isPending = false,
  form,
  onPress,
  className,
  "aria-label": ariaLabel,
  iconLeading,
  iconTrailing,
  children,
}: Readonly<ButtonProps>) {
  return (
    <AriaButton
      type={type}
      isDisabled={isDisabled}
      isPending={isPending}
      form={form}
      onPress={onPress}
      aria-label={ariaLabel}
      data-variant={variant}
      data-size={size}
      className={cn(BASE, SIZES[size], VARIANTS[variant], className)}
    >
      <ButtonLeadingIcon isPending={isPending} iconLeading={iconLeading} />
      {children}
      {iconTrailing ? <ButtonIcon name={iconTrailing} side="trailing" /> : null}
    </AriaButton>
  );
}

function ButtonLoadingIcon() {
  return (
    <Icon
      name="loading-03"
      data-testid="button-icon-loading"
      aria-hidden="true"
      className="animate-spin"
    />
  );
}

function ButtonLeadingIcon({
  isPending,
  iconLeading,
}: Readonly<Pick<ButtonProps, "isPending" | "iconLeading">>) {
  if (isPending) {
    return <ButtonLoadingIcon />;
  }
  if (!iconLeading) {
    return null;
  }
  return <ButtonIcon name={iconLeading} side="leading" />;
}

function ButtonIcon({ name, side }: Readonly<ButtonIconProps>) {
  return <Icon name={name} data-testid={`button-icon-${side}`} aria-hidden="true" />;
}
