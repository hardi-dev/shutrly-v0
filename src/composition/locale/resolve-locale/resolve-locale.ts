import "server-only";

import { DEFAULT_LOCALE, parseAppLocale } from "@/shared/locale/locale";
import type { AppLocale } from "@/shared/locale/locale.types";

import type { AccountLocaleInput, GalleryLocaleInput } from "./resolve-locale.types";

/**
 * Resolve the locale of an account surface (landing, auth, owner): the signed-in owner's stored
 * locale, else a valid device cookie, else the default. Accept-Language is never an input
 * (localization policy).
 * @param input - the owner locale (null without an owner session) and the raw device cookie
 * @returns the resolved app locale
 */
export function resolveAccountLocale(input: AccountLocaleInput): AppLocale {
  return input.ownerLocale ?? parseAppLocale(input.deviceCookie) ?? DEFAULT_LOCALE;
}

/**
 * Resolve the locale of a client gallery: the visitor's valid cookie for that link, else the
 * gallery owner's current locale, else the default. Never snapshotted (D-4).
 * @param input - the raw gallery cookie and the gallery owner's current locale
 * @returns the resolved app locale
 */
export function resolveGalleryLocale(input: GalleryLocaleInput): AppLocale {
  return parseAppLocale(input.clientCookie) ?? input.ownerLocale ?? DEFAULT_LOCALE;
}
