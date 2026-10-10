import "server-only";

import { createDrizzleClientAccessRepository } from "@/adapters/db/gallery-repository/drizzle-client-access-repository";
import { isWellFormedToken } from "@/features/gallery/domain/client-token/client-token";
import type { AppLocale } from "@/shared/locale/locale.types";
import { logger } from "@/shared/logging/logger";

import { withRequestDb } from "../../request-db/request-db";

/**
 * The gallery owner's current locale for a link, read on each request (D-4). A malformed token
 * never reaches the database (C-104). A lookup failure is logged without the token (C-103) and
 * resolves to null, so the gallery falls back to the default.
 * @param token - the raw token from the gallery path
 * @returns the owner's locale, or null for an unknown or malformed token or a failed lookup
 */
export async function loadGalleryOwnerLocale(token: string): Promise<AppLocale | null> {
  if (!isWellFormedToken(token)) return null;
  try {
    return await withRequestDb((db) =>
      createDrizzleClientAccessRepository(db).findOwnerLocaleByTokenUnscoped(token),
    );
  } catch {
    logger.error("l10n.gallery_owner_locale_failed");
    return null;
  }
}
