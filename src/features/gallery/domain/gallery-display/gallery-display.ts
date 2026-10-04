import { GALLERY_TIME_ZONE } from "../gallery-expiry/gallery-expiry";

const WEEKDAY_DATE = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: GALLERY_TIME_ZONE,
});
const TIME = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: GALLERY_TIME_ZONE,
});

/** Formats an instant as its day in the gallery zone, e.g. "Sel, 3 Nov 2026" (A-4). @param iso - ISO instant @returns the display date */
export function formatGalleryDate(iso: string): string {
  return WEEKDAY_DATE.format(new Date(iso));
}

/** Formats an instant with its time in the gallery zone, e.g. "Min, 4 Okt 2026 · 10.12". @param iso - ISO instant @returns the display date and time */
export function formatGalleryDateTime(iso: string): string {
  const date = new Date(iso);
  return `${WEEKDAY_DATE.format(date)} · ${TIME.format(date)}`;
}
