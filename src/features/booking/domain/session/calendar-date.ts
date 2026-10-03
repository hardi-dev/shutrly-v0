import { DATE_PATTERN } from "./session";

/** Tells whether a string is a real calendar date as YYYY-MM-DD. @param value - untrusted text @returns true for a real date */
export function isRealIsoDate(value: string): boolean {
  if (!DATE_PATTERN.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().startsWith(value);
}
