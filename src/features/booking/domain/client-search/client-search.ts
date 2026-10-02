import { WHATSAPP_SEPARATORS } from "../whatsapp-number/whatsapp-number";

/** TD-A-1: longer queries are ignored. */
export const CLIENT_SEARCH_MAX_LENGTH = 100;
const NUMBER_LIKE = /^\+?\d+$/;

/**
 * Reads the digits of a number-like query with BR-CLI-002's leading-0 step, so `0812…` matches `62812…` (A-4, D-7).
 * @param text - the trimmed query
 * @returns the digits, or null when the query is not number-like
 */
export function searchClientDigits(text: string): string | null {
  const stripped = text.replace(WHATSAPP_SEPARATORS, "");
  if (!NUMBER_LIKE.test(stripped)) return null;
  const digits = stripped.replace(/^\+/, "");
  return digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
}
