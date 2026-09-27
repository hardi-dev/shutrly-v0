"use client";

import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";

import { fieldErrorKeySchema } from "@/features/auth/application/errors/auth-errors/auth-errors.schema";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { FIELD_ERROR_COPY } from "./controlled-text-field.copy";
import type { ControlledTextFieldProps } from "./controlled-text-field.types";

function errorText(message: string | undefined): string | undefined {
  const key = fieldErrorKeySchema.safeParse(message);
  return key.success ? FIELD_ERROR_COPY[key.data] : undefined;
}

/**
 * A design-system TextField bound to React Hook Form. The field error is a FieldErrorKey from
 * the shared schema or the server, shown in the UI language (coding rules › Validation).
 * @param props - the form control, field name, and the translated label and placeholder
 * @returns the bound text field
 */
export function ControlledTextField<T extends FieldValues>({
  control,
  name,
  ...field
}: Readonly<ControlledTextFieldProps<T>>) {
  const { field: bound, fieldState } = useController({ control, name });
  const isPassword = field.type === "password";
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  let resolvedType = field.type;
  if (isPassword && isPasswordVisible) resolvedType = "text";
  let iconTrailing: "eye" | "eye-off" | undefined;
  let iconTrailingAction: { label: string; onPress: () => void } | undefined;
  if (isPassword) {
    iconTrailing = isPasswordVisible ? "eye-off" : "eye";
    iconTrailingAction = {
      label: isPasswordVisible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi",
      onPress: () => {
        setIsPasswordVisible((visible) => !visible);
      },
    };
  }
  return (
    <TextField
      {...field}
      type={resolvedType}
      name={bound.name}
      value={typeof bound.value === "string" ? bound.value : ""}
      onChange={bound.onChange}
      onBlur={bound.onBlur}
      inputRef={bound.ref}
      iconTrailing={iconTrailing}
      iconTrailingAction={iconTrailingAction}
      errorMessage={errorText(fieldState.error?.message)}
    />
  );
}
