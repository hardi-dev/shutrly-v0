/** Orders sources: active first, then by name ignoring case (A-3). @param sources - sources to sort @returns a new sorted array */
export function sortSources<T extends { readonly displayName: string; readonly isActive: boolean }>(
  sources: readonly T[],
): T[] {
  return [...sources].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return a.displayName.localeCompare(b.displayName, "id", { sensitivity: "base" });
  });
}
