/** Orders catalog entries: active first, then by name ignoring case (AC-CAT-005). @param entries - entries to sort @returns a new sorted array */
export function sortCatalogEntries<T extends { readonly name: string; readonly isActive: boolean }>(
  entries: readonly T[],
): T[] {
  return [...entries].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.name.localeCompare(b.name, "id", { sensitivity: "base" });
  });
}
