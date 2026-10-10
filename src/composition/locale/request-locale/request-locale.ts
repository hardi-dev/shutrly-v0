import "server-only";

import { headers } from "next/headers";
import { cache } from "react";

import { GALLERY_TOKEN_HEADER } from "@/shared/gallery-token/gallery-token-header";
import type { AppLocale } from "@/shared/locale/locale.types";

import { readDeviceLocaleCookie, readGalleryLocaleCookie } from "../locale-cookies/locale-cookies";
import { resolveAccountLocale, resolveGalleryLocale } from "../resolve-locale/resolve-locale";

/**
 * The locale of this request, resolved once and cached for the request only (§5.6). The owner
 * lookups are wired in I2; until then the owner input is null.
 * @returns the app locale for this request
 */
export const getRequestLocale: () => Promise<AppLocale> = cache(async () => {
  const isGallery = Boolean((await headers()).get(GALLERY_TOKEN_HEADER));
  if (isGallery) {
    return resolveGalleryLocale({
      clientCookie: await readGalleryLocaleCookie(),
      ownerLocale: null,
    });
  }
  return resolveAccountLocale({
    ownerLocale: null,
    deviceCookie: await readDeviceLocaleCookie(),
  });
});
