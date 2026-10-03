import type { SessionRecordShape, ShownSession } from "./session.types";

export const SESSION_NAME_MAX_LENGTH = 100;
export const SESSION_LOCATION_MAX_LENGTH = 200;

const WEEKDAY_DATE = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
const SHORT_DATE = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});
export const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Counts Unicode code points so emoji count once. @param value - text @returns the count */
export function codePointCount(value: string): number {
  return Array.from(value).length;
}

const atMidnight = (date: string) => new Date(`${date}T00:00:00Z`);
const displayTime = (time: string) => time.replace(":", ".");

/** Orders sessions by date, then start time with untimed first, then creation (BR-TEAM-003). @param a - left @param b - right @returns a sort comparison */
export function compareSessions(a: SessionRecordShape, b: SessionRecordShape): number {
  if (a.date !== b.date) return a.date < b.date ? -1 : 1;
  if (a.startTime !== b.startTime) {
    if (a.startTime === null) return -1;
    if (b.startTime === null) return 1;
    return a.startTime < b.startTime ? -1 : 1;
  }
  if (a.createdAt === b.createdAt) return 0;
  return a.createdAt < b.createdAt ? -1 : 1;
}

/** Picks the session shown in lists and headers: the earliest from today, else the latest (A-12). @param sessions - the project's sessions @param today - YYYY-MM-DD in the schedule zone @returns the shown session or null */
export function pickShownSession(
  sessions: readonly SessionRecordShape[],
  today: string,
): ShownSession | null {
  const sorted = [...sessions].sort(compareSessions);
  const upcoming = sorted.find((session) => session.date >= today);
  const shown = upcoming ?? sorted.at(-1);
  if (shown === undefined) return null;
  return { session: shown, extraCount: sorted.length - 1, isPast: upcoming === undefined };
}

/** Formats a date with its weekday, e.g. "Sel, 10 Nov 2026". @param date - YYYY-MM-DD @returns the display date */
export function formatWeekdayDate(date: string): string {
  return WEEKDAY_DATE.format(atMidnight(date));
}

/** Formats a date without the weekday, e.g. "10 Nov 2026". @param date - YYYY-MM-DD @returns the display date */
export function formatShortDate(date: string): string {
  return SHORT_DATE.format(atMidnight(date));
}

/** Formats when a session starts: the weekday date and the start time if any. @param session - the session @returns e.g. "Sel, 10 Nov 2026 · 07.30" */
export function formatSessionWhen(session: SessionRecordShape): string {
  const date = formatWeekdayDate(session.date);
  return session.startTime === null ? date : `${date} · ${displayTime(session.startTime)}`;
}

/** Formats a session's date, time range and location, dropping missing parts. @param session - the session @returns e.g. "Sel, 10 Nov 2026 · 06.30–07.15 · Rumah Rina, Depok" */
export function formatSessionRange(session: SessionRecordShape): string {
  return [formatWeekdayDate(session.date), formatTimeRange(session), session.location]
    .filter((part) => part !== null)
    .join(" · ");
}

function formatTimeRange(session: SessionRecordShape): string | null {
  if (session.startTime === null) return null;
  if (session.endTime === null) return displayTime(session.startTime);
  return `${displayTime(session.startTime)}–${displayTime(session.endTime)}`;
}
