"use client";

import type { ChangeEvent, ReactNode } from "react";
import { useCallback } from "react";
import { Input as AriaInput } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { InputFrameProps, InputIconName, InputIconProps, InputProps } from "./input.types";

const INPUT = [
  "h-(--component-input-height) w-full rounded-(--component-input-radius)",
  "border border-(--component-input-border) bg-(--component-input-background)",
  "px-(--component-input-padding-x)",
  "text-(length:--font-size-body) text-(--component-input-text)",
  "placeholder:text-(--component-input-placeholder)",
  "outline-none transition-colors",
  "data-hovered:border-(--component-input-border-hover)",
  "data-focused:border-(--component-input-border-focus)",
  "data-focused:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)]",
  "data-invalid:border-(--component-input-border-error)",
  "data-invalid:shadow-[inset_0_0_0_1px_var(--component-input-border-error)]",
  "data-disabled:border-(--component-input-border-disabled) data-disabled:bg-(--component-input-background-disabled)",
  "data-disabled:text-(--component-input-text-disabled)",
];

const LEFT_INSET = "pl-[calc(var(--component-input-padding-x)+var(--space-6))]";
const RIGHT_INSET = "pr-[calc(var(--component-input-padding-x)+var(--space-6))]";
const INPUT_ICON_PATHS: Record<InputIconName, ReactNode> = {
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  calendar: (
    <>
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </>
  ),
  eye: (
    <>
      <path d="M2.1 12.3a1 1 0 0 1 0-.6C3.5 8.1 7.3 5.5 12 5.5s8.5 2.6 9.9 6.2a1 1 0 0 1 0 .6C20.5 15.9 16.7 18.5 12 18.5s-8.5-2.6-9.9-6.2Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  "circle-alert": (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 8v4M12 16h.01" />
    </>
  ),
};

/**
 * Renders the reusable C03 input primitive and its optional adornments.
 * @param props - input value, state and C03 configuration properties
 * @returns the token-styled input
 */
export function Input({ variant = "default", type, ...props }: Readonly<InputProps>) {
  const resolvedType = type ?? (variant === "search" ? "search" : "text");
  return <InputFrame {...props} variant={variant} type={type} resolvedType={resolvedType} />;
}

function InputFrame({ resolvedType, variant, ...props }: Readonly<InputFrameProps>) {
  return (
    <span className="relative block w-full">
      <InputAdornment {...props} />
      <InputElement {...props} variant={variant} resolvedType={resolvedType} />
    </span>
  );
}

function InputElement({
  resolvedType,
  variant,
  value,
  defaultValue,
  onChange,
  onBlur,
  isDisabled,
  isReadOnly,
  isInvalid,
  prefix,
  iconLeading,
  iconTrailing,
  shortcut,
  className,
  inputRef,
  ...props
}: Readonly<InputFrameProps>) {
  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value),
    [onChange],
  );
  return (
    <AriaInput
      {...props}
      ref={inputRef}
      type={resolvedType}
      value={value}
      defaultValue={defaultValue}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={isDisabled}
      readOnly={isReadOnly}
      aria-invalid={isInvalid || undefined}
      role={variant === "search" ? "searchbox" : undefined}
      data-variant={variant}
      className={cn(
        INPUT,
        iconLeading || prefix ? LEFT_INSET : null,
        iconTrailing || shortcut ? RIGHT_INSET : null,
        className,
      )}
    />
  );
}

function InputAdornment({ prefix, iconLeading, iconTrailing, shortcut }: Readonly<InputProps>) {
  return (
    <>
      {iconLeading ? <InputIcon name={iconLeading} side="leading" /> : null}
      {prefix ? (
        <span className="pointer-events-none absolute inset-y-0 left-(--component-input-padding-x) flex items-center text-(--component-input-placeholder)">
          {prefix}
        </span>
      ) : null}
      {iconTrailing ? <InputIcon name={iconTrailing} side="trailing" /> : null}
      {shortcut ? (
        <kbd className="pointer-events-none absolute inset-y-0 right-(--component-input-padding-x) flex items-center text-(length:--font-size-label) text-(--component-input-placeholder)">
          {shortcut}
        </kbd>
      ) : null}
    </>
  );
}

function InputIcon({ name, side }: Readonly<InputIconProps>) {
  const common = {
    "aria-hidden": true,
    "data-testid": `input-icon-${side}`,
    width: 16,
    height: 16,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: cn(
      "pointer-events-none absolute inset-y-0 flex items-center text-(--component-input-placeholder)",
      side === "leading"
        ? "left-(--component-input-padding-x)"
        : "right-(--component-input-padding-x)",
    ),
  };

  return <svg {...common}>{INPUT_ICON_PATHS[name]}</svg>;
}
