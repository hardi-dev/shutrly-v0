"use client";

import { useEffect, useRef } from "react";

import {
  reformatAmountInput,
  reformatQuantityInput,
} from "@/features/booking/domain/locale-input/locale-input";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";

import type { LocaleReformatOptions, ReformatKind } from "./use-locale-reformat.types";

function reformat(
  kind: ReformatKind,
  raw: string,
  from: FormattingLocale,
  to: FormattingLocale,
): string {
  return kind === "amount"
    ? reformatAmountInput(raw, from, to)
    : reformatQuantityInput(raw, from, to);
}

/**
 * Keeps a typed amount or quantity in the format of the active language (AC-L10N-004). The locale
 * the text was typed in is remembered; when the language switches, the field is rewritten once
 * with the same value in the new format. Text that does not parse is left as typed (D-19).
 * @param options - the field's text, its setter and the value kind (`null` for plain text)
 */
export function useLocaleReformat({
  value,
  setValue,
  kind,
}: Readonly<LocaleReformatOptions>): void {
  const locale = useFormattingLocale();
  const typedIn = useRef<FormattingLocale>(locale);
  useEffect(() => {
    const from = typedIn.current;
    if (from === locale) return;
    typedIn.current = locale;
    if (kind === null) return;
    const next = reformat(kind, value, from, locale);
    if (next !== value) setValue(next);
  }, [kind, locale, setValue, value]);
}
