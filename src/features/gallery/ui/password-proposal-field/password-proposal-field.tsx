"use client";

import { TextField } from "@/ui/primitives/text-field/text-field";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { PasswordProposalFieldProps } from "./password-proposal-field.types";

/** A password input with a generated proposal and *Buat ulang* as a button inside the input, which stays while the field shows an error because it is what fixes one (Owner 2026-10-05; AC-GAL-001, AC-GAL-002, AC-GAL-021). @param props - label, helper, the form field binding, the error message and the regenerate handler @returns the field */
export function PasswordProposalField({
  label,
  description,
  field,
  errorMessage,
  isRegenerating,
  onRegenerate,
}: Readonly<PasswordProposalFieldProps>) {
  return (
    <TextField
      label={label}
      name={field.name}
      autoComplete="off"
      value={field.value}
      onChange={field.onChange}
      onBlur={field.onBlur}
      inputRef={field.ref}
      description={description}
      errorMessage={errorMessage}
      iconTrailing="refresh-cw"
      iconTrailingAction={{
        label: GALLERY_COPY.regenerate,
        onPress: onRegenerate,
        isDisabled: isRegenerating,
      }}
      keepTrailingOnError
    />
  );
}
