/** Builds up to two uppercase initials from letter-or-digit name words. @param name - client name @returns initials for an avatar */
export function clientInitials(name: string): string {
  const words = name.match(/[\p{L}\p{N}]+/gu) ?? [];
  const first = words.at(0);
  if (!first) return "";
  if (words.length === 1) return Array.from(first).slice(0, 2).join("").toUpperCase();
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0] ?? "")
    .join("")
    .toUpperCase();
}
