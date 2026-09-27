import { invoicePrefixSchema } from "./invoice-prefix.schema";
import type { InvoicePrefix } from "./invoice-prefix.types";

/** Suggests an invoice prefix from a workspace name according to A-3. @param name - the submitted workspace name @returns a valid uppercase invoice prefix */
export function suggestInvoicePrefix(name: string): InvoicePrefix {
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  const initials = words
    .map((word) => toAsciiLettersAndDigits(word.normalize("NFKD")).charAt(0))
    .join("");
  const candidate = initials.length >= 2 ? initials : toAsciiLettersAndDigits(name).slice(0, 3);
  return invoicePrefixSchema.parse(candidate.length >= 2 ? candidate.slice(0, 6) : "INV");
}

/** Trims and uppercases an invoice prefix while enforcing A-3. @param raw - the submitted prefix @returns the branded invoice prefix */
export function normaliseInvoicePrefix(raw: string): InvoicePrefix {
  return invoicePrefixSchema.parse(raw);
}

function toAsciiLettersAndDigits(value: string): string {
  return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
}
