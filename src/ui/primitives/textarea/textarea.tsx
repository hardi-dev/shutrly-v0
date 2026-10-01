"use client";

import type { ChangeEvent, ReactNode } from "react";
import {
  FieldError,
  Label,
  Text,
  TextArea as AriaTextArea,
  TextField,
} from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import { TEXTAREA_COPY } from "./textarea.copy";
import type { TextareaProps } from "./textarea.types";

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
}: Readonly<Pick<TextareaProps, "errorMessage" | "helperText" | "trailingMeta">>): ReactNode {
  if (!trailingMeta) {
    return <TextareaDescription errorMessage={errorMessage} helperText={helperText} />;
  }
  return (
    <div className="flex items-start justify-between gap-(--space-3)">
      <TextareaDescription errorMessage={errorMessage} helperText={helperText} />
      <span className="ml-auto shrink-0 text-(length:--font-size-label) text-(--component-input-helper)">
        {trailingMeta}
      </span>
    </div>
  );
}

function TextareaDescription({
  errorMessage,
  helperText,
}: Readonly<Pick<TextareaProps, "errorMessage" | "helperText">>): ReactNode {
  if (errorMessage) {
    return (
      <FieldError className="text-(length:--font-size-label) text-(--component-input-error-text)">
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

function TextareaLabel({
  label,
  optional,
  isLabelHidden,
}: Readonly<Pick<TextareaProps, "label" | "optional" | "isLabelHidden">>) {
  return (
    <Label
      className={cn(
        "text-(length:--font-size-label) text-(--component-input-label)",
        isLabelHidden && "sr-only",
      )}
    >
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
  isLabelHidden = false,
  rows = 3,
  trailingMeta,
  ...props
}: Readonly<TextareaProps>) {
  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => onChange?.(event.target.value);
  return (
    <TextField
      isInvalid={Boolean(errorMessage)}
      isDisabled={isDisabled}
      isReadOnly={isReadOnly}
      defaultValue={value === undefined ? defaultValue : undefined}
      className={cn("flex w-full flex-col gap-(--component-input-gap)", className)}
    >
      <TextareaLabel label={label} optional={optional} isLabelHidden={isLabelHidden} />
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
      />
    </TextField>
  );
}
