import { describe, expect, it } from "vitest";

import { PROJECT_SCHEDULE_TIME_ZONE, todayInScheduleZone } from "./schedule-clock";

describe("schedule clock (A-12)", () => {
  it("uses the Jakarta time zone", () => {
    expect(PROJECT_SCHEDULE_TIME_ZONE).toBe("Asia/Jakarta");
  });

  it("AC-PRJ-001 returns the calendar day in the schedule zone", () => {
    expect(todayInScheduleZone(new Date("2026-10-01T18:30:00Z"))).toBe("2026-10-02");
    expect(todayInScheduleZone(new Date("2026-10-01T16:59:00Z"))).toBe("2026-10-01");
  });
});
