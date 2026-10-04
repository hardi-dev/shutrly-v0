import type { GalleryStatus } from "../gallery-status/gallery-status.types";
import type {
  ExpiryInput,
  ExpiryResolution,
  ResolvedExpiry,
  StoredExpiry,
} from "./gallery-expiry.types";

// One MVP time zone, as F-07's schedule zone (A-4, D-2). Asia/Jakarta has no DST, so the
// end of a day is a fixed +07:00 instant.
export const GALLERY_TIME_ZONE = "Asia/Jakarta";
const GALLERY_ZONE_OFFSET = "+07:00";
export const GALLERY_EXPIRY_DAYS_MIN = 1;
export const GALLERY_EXPIRY_DAYS_MAX = 3650;
const DAY_MS = 86_400_000;

const DAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: GALLERY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Returns the calendar day in the gallery zone as YYYY-MM-DD (A-4). @param now - the instant @returns the day */
export function todayInGalleryZone(now: Date): string {
  return DAY_FORMAT.format(now);
}

/** Returns the last millisecond of a calendar day in the gallery zone (A-4, AC-GAL-019). @param date - YYYY-MM-DD @returns the expiry instant */
export function endOfGalleryDay(date: string): Date {
  return new Date(`${date}T23:59:59.999${GALLERY_ZONE_OFFSET}`);
}

/** Adds whole days to an instant (AC-GAL-018). @param from - the start instant @param days - whole days @returns the later instant */
export function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * DAY_MS);
}

/** Turns an expiry choice into the stored columns: a draft keeps a duration until publish, otherwise it counts from now (BR-GAL-005, D-2). @param input - the Owner's choice @param status - effective gallery status @param now - the current instant @returns the columns, or PAST_DATE for a day before today */
export function resolveExpiry(
  input: ExpiryInput,
  status: GalleryStatus,
  now: Date,
): ExpiryResolution {
  if (input.type === "NONE") return { ok: true, expiry: { expiresAt: null, expiryDays: null } };
  if (input.type === "DATE") {
    if (input.date < todayInGalleryZone(now)) return { ok: false, code: "PAST_DATE" };
    return { ok: true, expiry: { expiresAt: endOfGalleryDay(input.date), expiryDays: null } };
  }
  if (status === "DRAFT") return { ok: true, expiry: { expiresAt: null, expiryDays: input.days } };
  return { ok: true, expiry: { expiresAt: addDays(now, input.days), expiryDays: null } };
}

/** Computes the expiry written at publish: a stored duration counts from the publish time (BR-GAL-005, AC-GAL-018). @param stored - the draft's expiry columns @param now - the publish instant @returns the published expiry columns */
export function expiryOnPublish(stored: StoredExpiry, now: Date): ResolvedExpiry {
  if (stored.expiryDays === null) return { expiresAt: stored.expiresAt, expiryDays: null };
  return { expiresAt: addDays(now, stored.expiryDays), expiryDays: null };
}
