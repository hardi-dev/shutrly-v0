import type { ClientListKeyParts } from "./client-list-key.types";

/**
 * The synthetic cache key of one client photo-list page: the gallery and its content version
 * first, so any sync, publish, expiry, password or folder change starts a fresh key (D-22,
 * ADR-019 point 5). It holds no token, address or folder ID (C-103).
 * @param parts - gallery, content version and the browse query
 * @returns the key
 */
export function clientListKey(parts: ClientListKeyParts): string {
  const cursor = parts.cursor ? `${parts.cursor.sortKey}|${parts.cursor.id}` : "";
  return [
    parts.galleryId,
    String(parts.contentVersion),
    parts.kind,
    parts.sourceId ?? "",
    parts.path,
    parts.search,
    cursor,
  ]
    .map((part) => encodeURIComponent(part))
    .join(":");
}
