"use client";

import { FieldError, Input, Label, Text, TextField as AriaTextField } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import type { TextFieldProps } from "./text-field.types";

// C03 Input: 40 px high, 1 px border; focus and error read as 2 px via an inset shadow (no layout shift).
const INPUT = [
  "h-(--component-input-height) w-full rounded-(--component-input-radius)",
  "px-(--component-input-padding-x)",
  "border border-(--component-input-border) bg-(--component-input-background)",
  "text-(length:--font-size-body) text-(--component-input-text)",
  "placeholder:text-(--component-input-placeholder)",
  "outline-none transition-colors",
  "data-hovered:border-(--component-input-border-hover)",
  "data-focused:border-(--component-input-border-focus)",
  "data-focused:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)]",
  "data-invalid:border-(--component-input-border-error)",
  "data-invalid:shadow-[inset_0_0_0_1px_var(--component-input-border-error)]",
];

const MESSAGE = "text-(length:--font-size-label)";

/**
 * Design-system text field (C18 over C03): label, input, helper text, and an error that replaces
 * the helper. Invalid fields don't block submit (`validationBehavior="aria"`), which React Hook
 * Form relies on.
 * @param props - controlled `value` / `onChange`, plus `errorMessage` to mark it invalid
 * @returns the labelled field
 */
export function TextField({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  description,
  errorMessage,
  isReadOnly,
  value,
  onChange,
  onBlur,
  inputRef,
}: Readonly<TextFieldProps>) {
  const isInvalid = Boolean(errorMessage);
  return (
    <AriaTextField
      name={name}
      type={type}
      autoComplete={autoComplete}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      isReadOnly={isReadOnly}
      isInvalid={isInvalid}
      validationBehavior="aria"
      className="flex flex-col gap-(--component-input-gap)"
    >
      <Label className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {label}
      </Label>
      <Input ref={inputRef} placeholder={placeholder} className={cn(INPUT)} />
      {description && !isInvalid ? (
        <Text slot="description" className={cn(MESSAGE, "text-(--component-input-helper)")}>
          {description}
        </Text>
      ) : null}
      <FieldError
        className={cn(
          MESSAGE,
          "flex items-center gap-(--component-input-content-gap) text-(--component-input-error-text)",
        )}
      >
        <CircleAlertIcon />
        {errorMessage}
      </FieldError>
    </AriaTextField>
  );
}

function CircleAlertIcon() {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12.01" y1="16" y2="16" />
    </svg>
  );
}
