import { appLocaleSchema } from "./locale.schema";
import type { AppLocale, FormattingLocale } from "./locale.types";

export const DEFAULT_LOCALE: AppLocale = "en";

export const APP_LOCALES: readonly AppLocale[] = ["en", "id"];

const FORMATTING_LOCALES: Readonly<Record<AppLocale, FormattingLocale>> = Object.freeze({
  en: "en-US",
  id: "id-ID",
});

/**
 * Parse a stored or submitted locale value. Anything other than an exact supported code is rejected.
 * @param raw - the raw value from a cookie, a column or a form
 * @returns the locale, or null when the value is missing or not supported
 */
export function parseAppLocale(raw: string | undefined): AppLocale | null {
  const parsed = appLocaleSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

/**
 * Map an app locale to the formatting locale used for amounts and dates (ADR-025).
 * @param locale - the resolved app locale
 * @returns the matching formatting locale
 */
export function formattingLocale(locale: AppLocale): FormattingLocale {
  return FORMATTING_LOCALES[locale];
}
