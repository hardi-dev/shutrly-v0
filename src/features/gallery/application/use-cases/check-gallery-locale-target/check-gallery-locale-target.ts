import "server-only";

import { findAvailableGallery } from "../resolve-client-access/resolve-client-access";
import type { SignInGalleryDeps } from "../sign-in-gallery/sign-in-gallery.types";

/**
 * Tell whether a gallery link can receive a language choice: the same availability check as the
 * gate, so an unknown or unavailable token is refused and counts toward the unknown-token limit
 * (ADR-023). No gallery password is needed, so the locked password screen can use it (C-104).
 * @param deps - the request's client-access ports
 * @param token - the raw token from the gallery path
 * @param ip - the caller's address for the unknown-token limit
 * @returns true only when the link resolves to a gallery that is available to clients
 */
export async function checkGalleryLocaleTarget(
  deps: Pick<SignInGalleryDeps, "repository" | "rateLimiter" | "now">,
  token: string,
  ip: string,
): Promise<boolean> {
  const record = await findAvailableGallery(deps, token, ip);
  return record !== null && record.galleryId !== null;
}
