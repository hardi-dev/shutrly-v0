"use client";

import { useLocale } from "next-intl";

import { formattingLocale } from "@/shared/locale/locale";
import type { FormattingLocale } from "@/shared/locale/locale.types";

/**
 * The formatting locale of the active app locale, for amounts, quantities and dates (ADR-025).
 * @returns `en-US` or `id-ID`, following the provider locale
 */
export function useFormattingLocale(): FormattingLocale {
  return formattingLocale(useLocale());
}
