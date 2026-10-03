import type { IdrAmountResult } from "./idr-amount.types";

export const IDR_MAX = "999999999999";
const IDR_FORMAT = new Intl.NumberFormat("id-ID");

/** Parses whole rupiah typed with optional "Rp" and dot thousands separators (BR-CUR-001, A-7). @param raw - untrusted input @returns the digit string or a problem */
export function parseIdrAmount(raw: string): IdrAmountResult {
  const text = raw
    .replace(/^\s*Rp\s*/i, "")
    .replaceAll(".", "")
    .replaceAll(" ", "");
  if (text.length === 0) return { ok: false, problem: "EMPTY" };
  if (text.includes(",")) return { ok: false, problem: "NOT_WHOLE" };
  if (!/^\d+$/.test(text)) return { ok: false, problem: "INVALID" };
  const amount = text.replace(/^0+(?=\d)/, "");
  if (amount.length > IDR_MAX.length) return { ok: false, problem: "TOO_LARGE" };
  return { ok: true, amount };
}

/** Formats a whole-rupiah digit string, never through floating point (ADR-007). @param amount - digit string @returns e.g. "Rp 750.000" */
export function formatIdr(amount: string): string {
  return `Rp ${formatIdrNumber(amount)}`;
}

/** Groups a whole-rupiah digit string with dots, without the currency prefix. @param amount - digit string @returns e.g. "750.000" */
export function formatIdrNumber(amount: string): string {
  return IDR_FORMAT.format(BigInt(amount));
}

/** Normalizes the fixed-scale database representation without using floating point. */
export function canonicalIdrAmount(raw: string): string {
  return raw.replace(/^(\d+)\.0+$/, "$1");
}
