"use client";

import type { ChangeEvent } from "react";
import { useCallback } from "react";
import { Button as AriaButton, Input as AriaInput } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import { Icon } from "../icon/icon";
import type {
  InputAdornmentIconProps,
  InputFrameProps,
  InputIconName,
  InputIconProps,
  InputProps,
} from "./input.types";

const INPUT = [
  "h-(--component-input-height) w-full rounded-(--component-input-radius)",
  "border border-(--component-input-border) bg-(--component-input-background)",
  "px-(--component-input-padding-x)",
  "text-(length:--font-size-body) text-(--component-input-text)",
  "placeholder:text-(--component-input-placeholder)",
  "outline-none transition-colors",
  "[&::-webkit-search-cancel-button]:appearance-none",
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
const LEFT_COMPOUND_INSET =
  "pl-[calc(var(--component-input-padding-x)+var(--space-6)+var(--space-6))]";
const RIGHT_COMPOUND_INSET =
  "pr-[calc(var(--component-input-padding-x)+var(--space-6)+var(--space-6))]";
/**
 * Renders the reusable C03 input primitive and its optional adornments.
 * @param props - input value, state and C03 configuration properties
 * @returns the token-styled input
 */
export function Input({ variant = "default", type, ...props }: Readonly<InputProps>) {
  const resolvedType = type ?? (variant === "search" ? "search" : "text");
  return <InputFrame {...props} variant={variant} type={type} resolvedType={resolvedType} />;
}

function InputFrame({
  resolvedType,
  variant,
  iconLeadingAction,
  iconTrailingAction,
  ...props
}: Readonly<InputFrameProps>) {
  return (
    <span className="relative block w-full">
      <InputAdornment
        {...props}
        iconLeadingAction={iconLeadingAction}
        iconTrailingAction={iconTrailingAction}
      />
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
  const [leftInset, rightInset] = getInputInsets(iconLeading, prefix, iconTrailing, shortcut);
  return (
    <AriaInput
      {...props}
      suppressHydrationWarning
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
      className={cn(INPUT, leftInset, rightInset, className)}
    />
  );
}

function getInputInset(
  hasFirstAdornment: boolean,
  hasSecondAdornment: boolean,
  singleInset: string,
  compoundInset: string,
): string | null {
  if (hasFirstAdornment && hasSecondAdornment) {
    return compoundInset;
  }
  if (hasFirstAdornment || hasSecondAdornment) {
    return singleInset;
  }
  return null;
}

function getInputInsets(
  iconLeading: InputIconName | undefined,
  prefix: string | undefined,
  iconTrailing: InputIconName | undefined,
  shortcut: string | undefined,
): [string | null, string | null] {
  return [
    getInputInset(Boolean(iconLeading), Boolean(prefix), LEFT_INSET, LEFT_COMPOUND_INSET),
    getInputInset(Boolean(iconTrailing), Boolean(shortcut), RIGHT_INSET, RIGHT_COMPOUND_INSET),
  ];
}

function InputAdornment({
  prefix,
  iconLeading,
  iconLeadingAction,
  iconTrailing,
  iconTrailingAction,
  shortcut,
  isDisabled,
}: Readonly<InputProps>) {
  return (
    <>
      {iconLeading || prefix ? (
        <span
          data-testid="input-adornment-leading"
          aria-disabled={isDisabled ? "true" : undefined}
          className="pointer-events-none absolute inset-y-0 left-(--component-input-padding-x) flex items-center gap-(--space-1) text-(--component-input-placeholder)"
        >
          {iconLeading ? (
            <InputAdornmentIcon
              name={iconLeading}
              side="leading"
              action={iconLeadingAction}
              isDisabled={isDisabled}
            />
          ) : null}
          {prefix ? <span>{prefix}</span> : null}
        </span>
      ) : null}
      {iconTrailing || shortcut ? (
        <span
          data-testid="input-adornment-trailing"
          className="pointer-events-none absolute inset-y-0 right-(--component-input-padding-x) flex items-center gap-(--space-1) text-(--component-input-placeholder)"
        >
          {iconTrailing ? (
            <InputAdornmentIcon
              name={iconTrailing}
              side="trailing"
              action={iconTrailingAction}
              isDisabled={isDisabled}
            />
          ) : null}
          {shortcut ? <kbd className="text-(length:--font-size-label)">{shortcut}</kbd> : null}
        </span>
      ) : null}
    </>
  );
}

function InputAdornmentIcon({ name, side, action, isDisabled }: Readonly<InputAdornmentIconProps>) {
  const icon = <InputIcon name={name} side={side} />;
  if (!action) {
    return icon;
  }
  return (
    <AriaButton
      type="button"
      aria-label={action.label}
      onPress={action.onPress}
      isDisabled={isDisabled || action.isDisabled}
      className="pointer-events-auto flex size-(--space-6) items-center justify-center rounded-(--component-input-radius) outline-none focus-visible:shadow-[0_0_0_2px_var(--color-semantic-focus-ring),0_0_0_4px_var(--color-semantic-focus-glow)]"
    >
      {icon}
    </AriaButton>
  );
}

function InputIcon({ name, side }: Readonly<InputIconProps>) {
  return (
    <Icon
      name={name}
      data-testid={`input-icon-${side}`}
      aria-hidden="true"
      className="text-(--component-input-placeholder)"
    />
  );
}
