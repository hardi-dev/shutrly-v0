"use client";

import { IconButton } from "@/ui/primitives/icon-button/icon-button";
import { TextField } from "@/ui/primitives/text-field/text-field";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { PasswordProposalFieldProps } from "./password-proposal-field.types";

// Design (*Password row*): the button sits level with the input, not with the helper text, which
// can wrap to two lines. So it is pushed down by the label's height (12 px font, line height
// 1.25) plus the gap the field puts between label and input.
const BUTTON_OFFSET = "mt-[calc(var(--font-size-label)*1.25+var(--component-input-gap))]";

/** A password input with a generated proposal and a *Buat ulang* button level with the input (design.md › *Buat galeri*, *Ganti password*; AC-GAL-001, AC-GAL-021). @param props - label, helper, the form field binding, the error message and the regenerate handler @returns the field with its refresh button */
export function PasswordProposalField({
  label,
  description,
  field,
  errorMessage,
  isRegenerating,
  onRegenerate,
}: Readonly<PasswordProposalFieldProps>) {
  return (
    <div className="flex items-start gap-(--space-2)">
      <div className="min-w-0 flex-1">
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
        />
      </div>
      <div className={BUTTON_OFFSET}>
        <IconButton
          icon="refresh-cw"
          aria-label={GALLERY_COPY.regenerate}
          isDisabled={isRegenerating}
          onPress={onRegenerate}
        />
      </div>
    </div>
  );
}
