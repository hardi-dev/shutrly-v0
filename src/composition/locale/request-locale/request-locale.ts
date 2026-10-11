import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { loadSignedInOwnerLocale } from "@/composition/auth/owner-locale/owner-locale";
import { loadGalleryOwnerLocale } from "@/composition/gallery/gallery-owner-locale/gallery-owner-locale";
import { GALLERY_TOKEN_HEADER } from "@/shared/gallery-token/gallery-token-header";
import { parseAppLocale } from "@/shared/locale/locale";
import type { AppLocale } from "@/shared/locale/locale.types";

import { readDeviceLocaleCookie, readGalleryLocaleCookie } from "../locale-cookies/locale-cookies";
import { resolveAccountLocale, resolveGalleryLocale } from "../resolve-locale/resolve-locale";

/**
 * The locale of this request, resolved once and cached for the request only (§5.6). The owner
 * lookups are wired in I2; until then the owner input is null.
 * @returns the app locale for this request
 */
/**
 * The locale of this request, resolved once and cached for the request only (§5.6). A valid
 * gallery cookie skips the owner lookup (§5.3). A malformed gallery token never reaches the
 * database (C-104).
 * @returns the app locale for this request
 */
export const getRequestLocale: () => Promise<AppLocale> = cache(async () => {
  const galleryToken = (await headers()).get(GALLERY_TOKEN_HEADER);
  if (galleryToken) {
    const clientCookie = await readGalleryLocaleCookie();
    const ownerLocale = parseAppLocale(clientCookie)
      ? null
      : await loadGalleryOwnerLocale(galleryToken);
    return resolveGalleryLocale({ clientCookie, ownerLocale });
  }
  return resolveAccountLocale({
    ownerLocale: await loadSignedInOwnerLocale(),
    deviceCookie: await readDeviceLocaleCookie(),
  });
});
