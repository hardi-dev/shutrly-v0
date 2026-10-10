import type { FormattingLocale } from "@/shared/locale/locale.types";

import { GALLERY_TIME_ZONE } from "../gallery-expiry/gallery-expiry";

// Per formatting locale, in the gallery's time zone (D-20, D-23). Looked up through a frozen table,
// never a mutable one (§5.6). Time is 24-hour in both locales.
const FORMATS: Readonly<
  Record<
    FormattingLocale,
    {
      readonly weekday: Intl.DateTimeFormat;
      readonly short: Intl.DateTimeFormat;
      readonly time: Intl.DateTimeFormat;
    }
  >
> = Object.freeze({
  "id-ID": {
    weekday: new Intl.DateTimeFormat("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: GALLERY_TIME_ZONE,
    }),
    short: new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: GALLERY_TIME_ZONE,
    }),
    time: new Intl.DateTimeFormat("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: GALLERY_TIME_ZONE,
    }),
  },
  "en-US": {
    weekday: new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: GALLERY_TIME_ZONE,
    }),
    short: new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: GALLERY_TIME_ZONE,
    }),
    time: new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: GALLERY_TIME_ZONE,
    }),
  },
});

/**
 * Formats an instant as its day in the gallery zone, e.g. "Sel, 3 Nov 2026" (A-4).
 * @param iso - ISO instant
 * @param locale - the formatting locale
 * @returns the display date
 */
export function formatGalleryDate(iso: string, locale: FormattingLocale): string {
  return FORMATS[locale].weekday.format(new Date(iso));
}

/**
 * Formats an instant with its time in the gallery zone, e.g. "Min, 4 Okt 2026 · 10.12".
 * @param iso - ISO instant
 * @param locale - the formatting locale
 * @returns the display date and time
 */
export function formatGalleryDateTime(iso: string, locale: FormattingLocale): string {
  const date = new Date(iso);
  return `${FORMATS[locale].weekday.format(date)} · ${FORMATS[locale].time.format(date)}`;
}

/**
 * Formats an instant's time in the gallery zone, e.g. "10.12".
 * @param iso - ISO instant
 * @param locale - the formatting locale
 * @returns the time
 */
export function formatGalleryTime(iso: string, locale: FormattingLocale): string {
  return FORMATS[locale].time.format(new Date(iso));
}

/**
 * Formats an instant without the weekday, with its time, e.g. "4 Okt 2026 · 10.12" (phone rows).
 * @param iso - ISO instant
 * @param locale - the formatting locale
 * @returns the short date and time
 */
export function formatGalleryShortDateTime(iso: string, locale: FormattingLocale): string {
  const date = new Date(iso);
  return `${FORMATS[locale].short.format(date)} · ${FORMATS[locale].time.format(date)}`;
}

/**
 * Formats an instant as its day without the weekday, e.g. "5 Okt 2026" (Owner selection card).
 * @param iso - ISO instant
 * @param locale - the formatting locale
 * @returns the short date
 */
export function formatGalleryShortDate(iso: string, locale: FormattingLocale): string {
  return FORMATS[locale].short.format(new Date(iso));
}

/**
 * Formats an instant as day and time with a comma, e.g. "5 Okt 2026, 14.20" (Owner selection page).
 * @param iso - ISO instant
 * @param locale - the formatting locale
 * @returns the date and time
 */
export function formatGalleryDateAndTime(iso: string, locale: FormattingLocale): string {
  const date = new Date(iso);
  return `${FORMATS[locale].short.format(date)}, ${FORMATS[locale].time.format(date)}`;
}
