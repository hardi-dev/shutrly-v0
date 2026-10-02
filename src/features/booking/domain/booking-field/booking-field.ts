import type { FieldType, OptionsProblem } from "./booking-field.types";

export const FIELD_TYPES: readonly FieldType[] = [
  "TEXT",
  "TEXTAREA",
  "NUMBER",
  "DATE",
  "BOOLEAN",
  "SELECT",
];
export const FIELD_KEY_MAX_LENGTH = 50;
export const OPTION_MAX_COUNT = 50;
export const OPTION_MAX_LENGTH = 60;

/** Derives a stable snake_case key from a field name; renames never change it (A-3). @param name - the field name @returns the base key */
export function fieldKeyFromName(name: string): string {
  const slug = name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .split("_")
    .filter(Boolean)
    .join("_")
    .slice(0, FIELD_KEY_MAX_LENGTH);
  if (slug.length === 0) return "field";
  return /^[a-z]/.test(slug) ? slug : `field_${slug}`.slice(0, FIELD_KEY_MAX_LENGTH);
}

/** Makes a key unique among a service's keys by suffixing _2, _3, … (BR-CAT-006). @param base - the derived key @param existing - the service's keys @returns a free key */
export function uniqueFieldKey(base: string, existing: readonly string[]): string {
  const taken = new Set(existing);
  if (!taken.has(base)) return base;
  let suffix = 2;
  while (taken.has(`${base}_${String(suffix)}`)) suffix += 1;
  return `${base}_${String(suffix)}`;
}

/** Finds the first problem in a SELECT field's options (A-3). @param options - option labels @returns the problem (with index) or null */
export function findOptionsProblem(options: readonly string[]): OptionsProblem | null {
  if (options.length === 0) return { problem: "OPTIONS_REQUIRED" };
  if (options.length > OPTION_MAX_COUNT) return { problem: "TOO_MANY_OPTIONS" };
  const seen = new Set<string>();
  for (const [index, raw] of options.entries()) {
    const option = raw.trim();
    if (option.length === 0) return { problem: "OPTION_EMPTY", index };
    if (Array.from(option).length > OPTION_MAX_LENGTH) return { problem: "OPTION_TOO_LONG", index };
    if (seen.has(option.toLowerCase())) return { problem: "OPTION_DUPLICATE", index };
    seen.add(option.toLowerCase());
  }
  return null;
}
