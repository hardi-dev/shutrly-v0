import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { IdrAmountResult } from "./idr-amount.types";

export const IDR_MAX = "999999999999";

// Display per formatting locale (D-20, Owner 2026-10-10): id-ID "Rp 750.000", en-US "IDR 750,000".
// Looked up through a frozen table, never a mutable one (§5.6).
const DISPLAY: Readonly<
  Record<FormattingLocale, { readonly prefix: string; readonly format: Intl.NumberFormat }>
> = Object.freeze({
  "id-ID": { prefix: "Rp", format: new Intl.NumberFormat("id-ID") },
  "en-US": { prefix: "IDR", format: new Intl.NumberFormat("en-US") },
});

// The group separator is accepted; the decimal separator of the locale is NOT_WHOLE (D-19, C-105).
const GROUP_SEPARATOR: Readonly<Record<FormattingLocale, string>> = Object.freeze({
  "id-ID": ".",
  "en-US": ",",
});
const DECIMAL_SEPARATOR: Readonly<Record<FormattingLocale, string>> = Object.freeze({
  "id-ID": ",",
  "en-US": ".",
});

/**
 * Parses whole rupiah in the active locale: an optional `Rp`/`IDR` prefix, the locale's group
 * separator, and no decimals. The other locale's separator is never reinterpreted (D-19, C-105).
 * @param raw - untrusted input
 * @param locale - the formatting locale of the person typing
 * @returns the digit string or a problem
 */
export function parseIdrAmount(raw: string, locale: FormattingLocale): IdrAmountResult {
  const text = raw
    .replace(/^\s*(Rp|IDR)\s*/i, "")
    .replaceAll(" ", "")
    .replaceAll(GROUP_SEPARATOR[locale], "");
  if (text.length === 0) return { ok: false, problem: "EMPTY" };
  if (text.includes(DECIMAL_SEPARATOR[locale])) return { ok: false, problem: "NOT_WHOLE" };
  if (!/^\d+$/.test(text)) return { ok: false, problem: "INVALID" };
  const amount = text.replace(/^0+(?=\d)/, "");
  if (amount.length > IDR_MAX.length) return { ok: false, problem: "TOO_LARGE" };
  return { ok: true, amount };
}

/**
 * Formats a whole-rupiah digit string with the locale's prefix, never through floating point
 * (ADR-007).
 * @param amount - digit string
 * @param locale - the formatting locale
 * @returns e.g. "Rp 750.000" (id-ID) or "IDR 750,000" (en-US)
 */
export function formatIdr(amount: string, locale: FormattingLocale): string {
  return `${DISPLAY[locale].prefix} ${formatIdrNumber(amount, locale)}`;
}

/**
 * Groups a whole-rupiah digit string, without the currency prefix.
 * @param amount - digit string
 * @param locale - the formatting locale
 * @returns e.g. "750.000" (id-ID) or "750,000" (en-US)
 */
export function formatIdrNumber(amount: string, locale: FormattingLocale): string {
  return DISPLAY[locale].format.format(BigInt(amount));
}

/**
 * Normalizes the fixed-scale database representation without using floating point.
 * @param raw - the stored value
 * @returns the canonical whole-rupiah digit string
 */
export function canonicalIdrAmount(raw: string): string {
  return raw.replace(/^(\d+)\.0+$/, "$1");
}
