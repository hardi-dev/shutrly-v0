"use client";

import { FieldError, Label, Text, TextField as AriaTextField } from "react-aria-components";

import { cn } from "@/ui/cn/cn";

import { Input } from "../input/input";
import { TEXT_FIELD_COPY } from "./text-field.copy";
import type { TextFieldContentProps, TextFieldProps } from "./text-field.types";

const MESSAGE = "text-(length:--font-size-label)";

/**
 * Design-system text field (C18 over C03): label, input, helper text, and an error that replaces
 * the helper. Invalid fields don't block submit (`validationBehavior="aria"`), which React Hook
 * Form relies on.
 * @param props - controlled `value` / `onChange`, plus `errorMessage` to mark it invalid
 * @returns the labelled field
 */
export function TextField(props: Readonly<TextFieldProps>) {
  const isInvalid = Boolean(props.errorMessage);
  return (
    <AriaTextField
      name={props.name}
      type={props.type}
      autoComplete={props.autoComplete}
      value={props.value}
      onChange={props.onChange}
      onBlur={props.onBlur}
      isReadOnly={props.isReadOnly}
      isDisabled={props.isDisabled}
      isInvalid={isInvalid}
      validationBehavior="aria"
      className="flex flex-col gap-(--component-input-gap)"
    >
      <TextFieldContent {...props} isInvalid={isInvalid} />
    </AriaTextField>
  );
}

function TextFieldContent({ ...props }: Readonly<TextFieldContentProps>) {
  return (
    <>
      <TextFieldLabel {...props} />
      <TextFieldInput {...props} />
      <TextFieldMessage {...props} />
    </>
  );
}

function TextFieldLabel({ label, isOptional }: Readonly<TextFieldContentProps>) {
  return (
    <div className="flex items-center gap-(--space-1)">
      <Label className="text-(length:--font-size-label) font-semibold text-(--component-input-label)">
        {label}
      </Label>
      {isOptional ? (
        <span className="text-(length:--font-size-label) text-(--component-input-helper)">
          {TEXT_FIELD_COPY.optionalSuffix}
        </span>
      ) : null}
    </div>
  );
}

function TextFieldInput({
  type = "text",
  autoComplete,
  placeholder,
  isReadOnly,
  isDisabled,
  isInvalid,
  prefix,
  iconLeading,
  iconTrailing,
  shortcut,
  name,
  value,
  onChange,
  inputRef,
}: Readonly<TextFieldContentProps>) {
  return (
    <Input
      inputRef={inputRef}
      type={type}
      autoComplete={autoComplete}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      isReadOnly={isReadOnly}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      prefix={prefix}
      iconLeading={iconLeading}
      iconTrailing={iconTrailing}
      shortcut={shortcut}
    />
  );
}

function TextFieldMessage({
  description,
  errorMessage,
  isInvalid,
}: Readonly<TextFieldContentProps>) {
  return (
    <>
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
    </>
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
