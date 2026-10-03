export const PROJECT_SCHEDULE_TIME_ZONE = "Asia/Jakarta";

const DAY_FORMAT = new Intl.DateTimeFormat("en-CA", {
  timeZone: PROJECT_SCHEDULE_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** Returns the calendar day in the schedule zone, as YYYY-MM-DD (A-12, D-9). @param now - the instant @returns the day */
export function todayInScheduleZone(now: Date): string {
  return DAY_FORMAT.format(now);
}
