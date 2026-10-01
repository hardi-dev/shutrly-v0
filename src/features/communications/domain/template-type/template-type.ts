import type { TemplateGroup, TemplateType } from "./template-type.types";

// BR-MSG-002 types in journey order (A-5); the list, the seed and the backfill follow it.
export const TEMPLATE_TYPES = [
  "GALLERY_SHARE",
  "SELECTION_REMINDER",
  "FINAL_DELIVERY",
  "INVOICE_SHARE",
  "PAYMENT_REMINDER",
] as const;

const INVOICE_TYPES: readonly TemplateType[] = ["INVOICE_SHARE", "PAYMENT_REMINDER"];

/**
 * Checks that a stored or routed value is one of the five template types (BR-MSG-002).
 * @param value - the raw value
 * @returns whether the value is a template type
 */
export function isTemplateType(value: string): value is TemplateType {
  return TEMPLATE_TYPES.some((type) => type === value);
}

/**
 * Places a template type under the Gallery or Invoice group of the list (A-5).
 * @param type - the template type
 * @returns its list group
 */
export function templateGroupOf(type: TemplateType): TemplateGroup {
  return INVOICE_TYPES.includes(type) ? "INVOICE" : "GALLERY";
}

/**
 * Converts a template type to its editor URL slug, e.g. `GALLERY_SHARE` → `gallery-share`.
 * @param type - the template type
 * @returns the URL slug
 */
export function templateSlugOf(type: TemplateType): string {
  return type.toLowerCase().replaceAll("_", "-");
}

/**
 * Resolves an editor URL slug to its template type.
 * @param slug - the untrusted route segment
 * @returns the template type, or null for an unknown slug
 */
export function templateTypeFromSlug(slug: string): TemplateType | null {
  return TEMPLATE_TYPES.find((type) => templateSlugOf(type) === slug) ?? null;
}
