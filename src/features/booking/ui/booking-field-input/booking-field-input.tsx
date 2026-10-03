"use client";

import { DateField } from "@/ui/patterns/date-field/date-field";
import { Select } from "@/ui/patterns/select/select";
import { TextField } from "@/ui/primitives/text-field/text-field";
import { Textarea } from "@/ui/primitives/textarea/textarea";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { BookingFieldInputProps } from "./booking-field-input.types";

const noop = () => undefined;
const YES = "true";
const NO = "false";

function asText(value: BookingFieldInputProps["value"]): string {
  return typeof value === "string" ? value : "";
}

function booleanId(value: BookingFieldInputProps["value"]): string | null {
  if (value === null) return null;
  return value ? YES : NO;
}

/** Renders the input that matches a booking field's type (A-3): text, long text, number, date, yes/no or choice. */
export function BookingFieldInput(props: Readonly<BookingFieldInputProps>) {
  switch (props.field.fieldType) {
    case "TEXTAREA":
      return <LongTextInput {...props} />;
    case "DATE":
      return <DateValueInput {...props} />;
    case "BOOLEAN":
      return <YesNoInput {...props} />;
    case "SELECT":
      return <OptionInput {...props} />;
    default:
      return <ShortTextInput {...props} />;
  }
}

function ShortTextInput({
  field,
  value,
  onChange,
  errorMessage,
}: Readonly<BookingFieldInputProps>) {
  return (
    <TextField
      label={field.name}
      isOptional={!field.isRequired}
      name={field.key}
      value={asText(value)}
      onChange={onChange}
      onBlur={noop}
      errorMessage={errorMessage}
    />
  );
}

function LongTextInput({ field, value, onChange, errorMessage }: Readonly<BookingFieldInputProps>) {
  return (
    <Textarea
      label={field.name}
      optional={!field.isRequired}
      name={field.key}
      value={asText(value)}
      onChange={onChange}
      errorMessage={errorMessage}
    />
  );
}

function DateValueInput({
  field,
  value,
  onChange,
  errorMessage,
}: Readonly<BookingFieldInputProps>) {
  return (
    <DateField
      label={field.name}
      isOptional={!field.isRequired}
      value={asText(value) === "" ? null : asText(value)}
      onChange={onChange}
      display="date"
      errorMessage={errorMessage}
    />
  );
}

function YesNoInput({ field, value, onChange, errorMessage }: Readonly<BookingFieldInputProps>) {
  const handleChange = (id: string) => {
    onChange(id === YES);
  };
  return (
    <Select
      label={field.name}
      isOptional={!field.isRequired}
      placeholder={PROJECT_COPY.fieldSelectPlaceholder(field.name)}
      options={[
        { id: YES, label: PROJECT_COPY.fieldYes },
        { id: NO, label: PROJECT_COPY.fieldNo },
      ]}
      value={booleanId(value)}
      onChange={handleChange}
      errorMessage={errorMessage}
    />
  );
}

function OptionInput({ field, value, onChange, errorMessage }: Readonly<BookingFieldInputProps>) {
  return (
    <Select
      label={field.name}
      isOptional={!field.isRequired}
      placeholder={PROJECT_COPY.fieldSelectPlaceholder(field.name)}
      options={(field.options ?? []).map((option) => ({ id: option, label: option }))}
      value={asText(value) === "" ? null : asText(value)}
      onChange={onChange}
      errorMessage={errorMessage}
    />
  );
}
