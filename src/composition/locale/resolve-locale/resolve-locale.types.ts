import type { AppLocale } from "@/shared/locale/locale.types";

export type AccountLocaleInput = {
  /** The signed-in owner's stored locale, or null when no owner session applies. */
  readonly ownerLocale: AppLocale | null;
  /** Raw value of the device cookie `shutrly_locale`, if the browser sent one. */
  readonly deviceCookie: string | undefined;
};

export type GalleryLocaleInput = {
  /** Raw value of the gallery cookie `shutrly_gallery_locale` for this link. */
  readonly clientCookie: string | undefined;
  /** The gallery owner's current locale, or null when unknown. */
  readonly ownerLocale: AppLocale | null;
};
