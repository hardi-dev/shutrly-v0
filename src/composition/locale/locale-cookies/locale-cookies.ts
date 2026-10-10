import "server-only";

import { cookies } from "next/headers";

import type { AppLocale } from "@/shared/locale/locale.types";

/** The device-wide language preference, read before sign-in (D-3). */
export const DEVICE_LOCALE_COOKIE = "shutrly_locale";
/** A visitor's language choice for one gallery link only (D-4, D-5). */
export const GALLERY_LOCALE_COOKIE = "shutrly_gallery_locale";
/** One year, so the choice survives between visits (§11). */
export const LOCALE_COOKIE_MAX_AGE_SECONDS = 31_536_000;

/**
 * Read the raw device locale cookie of this request. The value is not validated here; the
 * resolver ignores anything that is not a supported locale.
 * @returns the raw cookie value, or undefined when absent
 */
export async function readDeviceLocaleCookie(): Promise<string | undefined> {
  return (await cookies()).get(DEVICE_LOCALE_COOKIE)?.value;
}

/**
 * Store the device-wide language preference for the whole site.
 * @param locale - the chosen app locale
 * @returns nothing
 */
export async function writeDeviceLocaleCookie(locale: AppLocale): Promise<void> {
  (await cookies()).set({
    name: DEVICE_LOCALE_COOKIE,
    value: locale,
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
  });
}

/**
 * Read the raw gallery locale cookie of this request. Only the gallery route sends it, because
 * the cookie is path-scoped to that link.
 * @returns the raw cookie value, or undefined when absent
 */
export async function readGalleryLocaleCookie(): Promise<string | undefined> {
  return (await cookies()).get(GALLERY_LOCALE_COOKIE)?.value;
}

/**
 * Store a visitor's language choice for one gallery link (`Path=/g/<token>`).
 * @param token - the raw gallery token of the link the visitor is viewing
 * @param locale - the chosen app locale
 * @returns nothing
 */
export async function writeGalleryLocaleCookie(token: string, locale: AppLocale): Promise<void> {
  (await cookies()).set({
    name: GALLERY_LOCALE_COOKIE,
    value: locale,
    path: `/g/${token}`,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: LOCALE_COOKIE_MAX_AGE_SECONDS,
  });
}
