import type { SourceNameProblem } from "./source-name.types";

export const SOURCE_NAME_MAX_LENGTH = 60;

/** Trims a display name. @param raw - untrusted name @returns the stored form */
export function normaliseSourceName(raw: string): string {
  return raw.trim();
}

/** Counts code points like Postgres char_length. @param name - a name @returns its length */
export function sourceNameLength(name: string): number {
  return Array.from(name).length;
}

/** Finds the first rule a name breaks (BR-SRC-005). @param raw - untrusted name @returns the problem or null */
export function findSourceNameProblem(raw: string): SourceNameProblem | null {
  const name = normaliseSourceName(raw);
  if (name.length === 0) return "EMPTY";
  if (sourceNameLength(name) > SOURCE_NAME_MAX_LENGTH) return "TOO_LONG";
  return null;
}

/** The case-insensitive identity of a name, as the DB index compares it. @param raw - a name @returns the key */
export function sourceNameKey(raw: string): string {
  return normaliseSourceName(raw).toLowerCase();
}
