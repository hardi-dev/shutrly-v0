"use client";

import { Button as AriaButton, Link as AriaLink } from "react-aria-components";

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
export function Button(props: Readonly<ButtonProps>) {
  const { variant = "primary", size = "md", isPending = false, className, href } = props;
  const classes = cn(BASE, SIZES[size], VARIANTS[variant], className);
  const content = (
    <>
      <ButtonLeadingIcon isPending={isPending} iconLeading={props.iconLeading} />
      {props.children}
      {props.iconTrailing ? <ButtonIcon name={props.iconTrailing} side="trailing" /> : null}
    </>
  );
  if (href !== undefined) {
    const rel = props.target === "_blank" ? "noopener noreferrer" : undefined;
    return (
      <AriaLink
        href={href}
        target={props.target}
        rel={rel}
        id={props.id}
        aria-label={props["aria-label"]}
        isDisabled={props.isDisabled}
        data-variant={variant}
        data-size={size}
        className={classes}
      >
        {content}
      </AriaLink>
    );
  }
  return (
    <AriaButton
      type={props.type ?? "button"}
      isDisabled={props.isDisabled}
      isPending={isPending}
      form={props.form}
      id={props.id}
      onPress={props.onPress}
      aria-label={props["aria-label"]}
      data-variant={variant}
      data-size={size}
      className={classes}
    >
      {content}
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
