import type { CatalogNameProblem } from "./catalog-name.types";

export const CATALOG_NAME_MAX_LENGTH = 60;

/** Trims a catalog name (category, definition, service, booking field). @param raw - untrusted name @returns the stored form */
export function normaliseCatalogName(raw: string): string {
  return raw.trim();
}

/** Finds the first rule a catalog name breaks (BR-CAT-009). @param raw - untrusted name @returns the problem or null */
export function findCatalogNameProblem(raw: string): CatalogNameProblem | null {
  const name = normaliseCatalogName(raw);
  if (name.length === 0) return "EMPTY";
  if (Array.from(name).length > CATALOG_NAME_MAX_LENGTH) return "TOO_LONG";
  return null;
}

/** The case-insensitive identity of a name, as the DB index compares it. @param raw - a name @returns the key */
export function catalogNameKey(raw: string): string {
  return normaliseCatalogName(raw).toLowerCase();
}
