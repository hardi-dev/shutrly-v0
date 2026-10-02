const INDONESIA = "62";

/** BR-CLI-002: the separators removed before anything else. */
export const WHATSAPP_SEPARATORS = /[\s\-.()]/g;
/** BR-CLI-002: 10–15 digits with the country code, no leading 0, no 0 right after 62. The DB check repeats it. */
export const WHATSAPP_NUMBER_PATTERN = /^(?!620)[1-9]\d{9,14}$/;

/** BR-CLI-002: removes separators and applies the first matching country-code prefix step. @param raw - the typed number @returns normalised digits before validation */
export function normaliseWhatsappNumber(raw: string): string {
  const value = raw.replace(WHATSAPP_SEPARATORS, "");
  if (value.startsWith("+")) return value.slice(1);
  if (value.startsWith("0")) return `62${value.slice(1)}`;
  if (value.startsWith("8")) return `62${value}`;
  return value;
}

/** BR-CLI-002: turns a blank field into null after removing separators. @param raw - the typed number @returns null for blank fields or the original input */
export function optionalWhatsappValue(raw: string): string | null {
  return raw.replace(WHATSAPP_SEPARATORS, "") === "" ? null : raw;
}

/**
 * Shows a stored number as `+62 812-3456-7890` for Indonesia and `+<digits>` otherwise (A-7).
 * @param digits - the stored number
 * @returns the display form, which whatsappNumberSchema parses back to the same digits
 */
export function formatWhatsappNumber(digits: string): string {
  if (!digits.startsWith(INDONESIA)) return `+${digits}`;
  const rest = digits.slice(INDONESIA.length);
  const groups = [rest.slice(0, 3), rest.slice(3, 7), rest.slice(7)].filter(
    (group) => group.length > 0,
  );
  return `+${INDONESIA} ${groups.join("-")}`;
}

/**
 * Builds the plain WhatsApp chat link for a stored number, with no prefilled text (A-6, ADR-006).
 * @param digits - the stored number
 * @returns the `wa.me` URL
 */
export function whatsappChatUrl(digits: string): string {
  return `https://wa.me/${digits}`;
}
