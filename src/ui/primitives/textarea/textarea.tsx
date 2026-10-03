"use client";

import { type ChangeEvent, type ReactNode, useId } from "react";
import {
  FieldError,
  Label,
  Text,
  TextArea as AriaTextArea,
  TextField,
} from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import { TEXTAREA_COPY } from "./textarea.copy";
import type {
  TextareaDescriptionProps,
  TextareaFooterProps,
  TextareaProps,
} from "./textarea.types";

const TEXTAREA = [
  "min-h-(--component-textarea-min-height) w-full resize-y rounded-(--component-input-radius)",
  "border border-(--component-input-border) bg-(--component-input-background)",
  "px-(--component-input-padding-x) py-(--component-input-padding-y)",
  "text-(length:--font-size-body) text-(--component-input-text) outline-none",
  "placeholder:text-(--component-input-placeholder)",
  "data-hovered:border-(--component-input-border-hover)",
  "data-focused:border-(--component-input-border-focus)",
  "data-focused:shadow-[inset_0_0_0_1px_var(--component-input-border-focus),0_0_0_4px_var(--color-semantic-focus-glow)]",
  "data-invalid:border-(--component-input-border-error)",
  "data-disabled:border-(--component-input-border-disabled) data-disabled:bg-(--component-input-background-disabled)",
  "data-disabled:text-(--component-input-text-disabled)",
];

function TextareaFooter({
  errorMessage,
  helperText,
  trailingMeta,
  errorMessageId,
}: Readonly<TextareaFooterProps>): ReactNode {
  if (!trailingMeta) {
    return (
      <TextareaDescription
        errorMessage={errorMessage}
        helperText={helperText}
        errorMessageId={errorMessageId}
      />
    );
  }
  return (
    <div className="flex items-start justify-between gap-(--space-3)">
      <TextareaDescription
        errorMessage={errorMessage}
        helperText={helperText}
        errorMessageId={errorMessageId}
      />
      <span className="ml-auto shrink-0 text-(length:--font-size-label) text-(--component-input-helper)">
        {trailingMeta}
      </span>
    </div>
  );
}

function TextareaDescription({
  errorMessage,
  helperText,
  errorMessageId,
}: Readonly<TextareaDescriptionProps>): ReactNode {
  if (errorMessage) {
    return (
      <FieldError
        id={errorMessageId}
        className="text-(length:--font-size-label) text-(--component-input-error-text)"
      >
        {errorMessage}
      </FieldError>
    );
  }
  if (helperText) {
    return (
      <Text
        slot="description"
        className="text-(length:--font-size-label) text-(--component-input-helper)"
      >
        {helperText}
      </Text>
    );
  }
  return null;
}

function TextareaLabel({ label, optional }: Readonly<Pick<TextareaProps, "label" | "optional">>) {
  if (!label) return null;
  return (
    <Label className="text-(length:--font-size-label) text-(--component-input-label)">
      {label}
      {optional ? (
        <span className="ml-(--space-1) text-(--component-input-helper)">
          {TEXTAREA_COPY.optional}
        </span>
      ) : null}
    </Label>
  );
}

/** Renders a labelled, token-backed React Aria textarea field.
 * @param props - label, messages, value and textarea state
 * @returns the textarea field
 */
export function Textarea({
  label,
  "aria-label": ariaLabel,
  optional = false,
  helperText,
  errorMessage,
  onChange,
  textareaRef,
  className,
  isDisabled,
  isReadOnly,
  value,
  defaultValue,
  rows = 3,
  trailingMeta,
  ...props
}: Readonly<TextareaProps>) {
  const errorMessageId = useId();
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => onChange?.(event.target.value);
  return (
    <TextField
      aria-label={ariaLabel}
      aria-errormessage={errorMessage ? errorMessageId : undefined}
      isInvalid={Boolean(errorMessage)}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      defaultValue={value === undefined ? defaultValue : undefined}
      className={cn("flex w-full flex-col gap-(--component-input-gap)", className)}
    >
      <TextareaLabel label={label} optional={optional} />
      <AriaTextArea
        {...props}
        ref={textareaRef}
        {...(value !== undefined ? { value } : {})}
        disabled={isDisabled}
        readOnly={isReadOnly}
        rows={rows}
        onChange={handleChange}
        className={cn(TEXTAREA)}
      />
      <TextareaFooter
        errorMessage={errorMessage}
        helperText={helperText}
        trailingMeta={trailingMeta}
        errorMessageId={errorMessageId}
      />
    </TextField>
  );
}
