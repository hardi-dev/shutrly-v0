"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import type { FieldValues } from "react-hook-form";
import { useController } from "react-hook-form";

import { fieldErrorKeySchema } from "@/features/auth/application/errors/auth-errors/auth-errors.schema";
import { TextField } from "@/ui/primitives/text-field/text-field";

import {
  CONTROLLED_TEXT_FIELD_COPY_NAMESPACE,
  FIELD_ERROR_MESSAGE_KEY,
} from "./controlled-text-field.copy";
import type { ControlledTextFieldProps, FieldTranslate } from "./controlled-text-field.types";

function errorText(message: string | undefined, t: FieldTranslate): string | undefined {
  const key = fieldErrorKeySchema.safeParse(message);
  return key.success ? t(FIELD_ERROR_MESSAGE_KEY[key.data]) : undefined;
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
  const t = useTranslations(CONTROLLED_TEXT_FIELD_COPY_NAMESPACE);
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
      label: isPasswordVisible ? t("hidePassword") : t("showPassword"),
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
      errorMessage={errorText(fieldState.error?.message, t)}
    />
  );
}
