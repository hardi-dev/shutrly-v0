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
/** The durations, in days, the Owner may pick for a gallery's expiry (A-1, BR-GAL-005). */
export const GALLERY_EXPIRY_PRESETS: readonly number[] = [7, 14, 30, 60, 90];
const DAY_MS = 86_400_000;

const DAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: GALLERY_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Tells whether a duration is one of the presets (A-1, AC-GFL-011). @param days - whole days @returns true for a preset duration */
export function isExpiryPreset(days: number): boolean {
  return GALLERY_EXPIRY_PRESETS.some((preset) => preset === days);
}

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

/**
 * Turns an expiry choice into the stored expiry (BR-GAL-005, A-2, D-8). A duration counts from the
 * save time; today means the save time itself, so the gallery closes at once; a later date means
 * the end of that day in Asia/Jakarta. A day before today is refused.
 * @param input - the Owner's choice
 * @param now - the save instant
 * @returns the expiry columns, or PAST_DATE for a day before today
 */
export function resolveExpiry(input: ExpiryInput, now: Date): ExpiryResolution {
  if (input.type === "NONE") return { ok: true, expiry: { expiresAt: null, expiryDays: null } };
  if (input.type === "DAYS") {
    return { ok: true, expiry: { expiresAt: addDays(now, input.days), expiryDays: null } };
  }
  const today = todayInGalleryZone(now);
  if (input.date < today) return { ok: false, code: "PAST_DATE" };
  const expiresAt = input.date === today ? now : endOfGalleryDay(input.date);
  return { ok: true, expiry: { expiresAt, expiryDays: null } };
}

/** Computes the expiry written at publish: a stored duration counts from the publish time (BR-GAL-005, AC-GAL-018). @param stored - the draft's expiry columns @param now - the publish instant @returns the published expiry columns */
export function expiryOnPublish(stored: StoredExpiry, now: Date): ResolvedExpiry {
  if (stored.expiryDays === null) return { expiresAt: stored.expiresAt, expiryDays: null };
  return { expiresAt: addDays(now, stored.expiryDays), expiryDays: null };
}
