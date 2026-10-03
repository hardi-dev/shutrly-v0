import { describe, expect, it } from "vitest";

import {
  compareSessions,
  formatSessionRange,
  formatSessionWhen,
  formatShortDate,
  pickShownSession,
  SESSION_LOCATION_MAX_LENGTH,
  SESSION_NAME_MAX_LENGTH,
} from "./session";
import { sessionInputSchema } from "./session.schema";
import type { SessionRecordShape } from "./session.types";

const session = (overrides: Partial<SessionRecordShape>): SessionRecordShape => ({
  id: "s",
  name: "Sesi",
  date: "2026-10-20",
  startTime: null,
  endTime: null,
  location: null,
  createdAt: "2026-10-01T00:00:00Z",
  ...overrides,
});

const valid = { name: "Akad", date: "2026-11-10", startTime: null, endTime: null, location: null };
const issueOf = (input: object) => {
  const result = sessionInputSchema.safeParse({ ...valid, ...input });
  return result.error?.issues[0]?.message;
};

describe("session input (BR-TEAM-003, AC-PRJ-029)", () => {
  it("accepts a name and a date alone and trims the text", () => {
    expect(sessionInputSchema.parse({ ...valid, name: " Akad ", location: " Depok " })).toEqual({
      ...valid,
      location: "Depok",
    });
    expect(sessionInputSchema.parse({ ...valid, location: "  " }).location).toBeNull();
  });

  it("AC-PRJ-029 rejects each invalid session field", () => {
    expect(issueOf({ name: " " })).toBe("EMPTY");
    expect(issueOf({ date: "" })).toBe("EMPTY");
    expect(issueOf({ date: "2026-02-30" })).toBe("INVALID");
    expect(issueOf({ name: "a".repeat(SESSION_NAME_MAX_LENGTH + 1) })).toBe("TOO_LONG");
    expect(issueOf({ location: "a".repeat(SESSION_LOCATION_MAX_LENGTH + 1) })).toBe("TOO_LONG");
    expect(issueOf({ startTime: "7:30" })).toBe("INVALID");
  });

  it("AC-PRJ-029 rejects an end time without a start or not after it", () => {
    expect(issueOf({ endTime: "08:00" })).toBe("END_WITHOUT_START");
    expect(issueOf({ startTime: "07:30", endTime: "07:00" })).toBe("END_NOT_AFTER_START");
    expect(issueOf({ startTime: "07:30", endTime: "07:30" })).toBe("END_NOT_AFTER_START");
    expect(issueOf({ startTime: "07:30", endTime: "10:00" })).toBeUndefined();
  });
});

describe("session order and shown session (A-12)", () => {
  it("sorts by date, then untimed first, then start time, then creation", () => {
    const a = session({ id: "a", date: "2026-10-21" });
    const b = session({ id: "b", date: "2026-10-20", startTime: "09:00" });
    const c = session({ id: "c", date: "2026-10-20", startTime: "06:00" });
    const d = session({ id: "d", date: "2026-10-20" });
    expect([a, b, c, d].sort(compareSessions).map((s) => s.id)).toEqual(["d", "c", "b", "a"]);
    const early = session({ id: "e", createdAt: "2026-10-01T00:00:00Z" });
    const late = session({ id: "l", createdAt: "2026-10-02T00:00:00Z" });
    expect([late, early].sort(compareSessions).map((s) => s.id)).toEqual(["e", "l"]);
  });

  it("AC-PRJ-001 shows the earliest session from today with the extra count", () => {
    const first = session({ id: "1", date: "2026-10-20", startTime: "06:00" });
    const second = session({ id: "2", date: "2026-10-21" });
    const shown = pickShownSession([second, first], "2026-10-02");
    expect(shown?.session.id).toBe("1");
    expect(shown).toMatchObject({ extraCount: 1, isPast: false });
  });

  it("AC-PRJ-001 shows the latest session when all are past, and none when empty", () => {
    const past = session({ id: "p", date: "2026-08-16", startTime: "16:00" });
    expect(pickShownSession([past], "2026-10-02")).toMatchObject({ isPast: true, extraCount: 0 });
    expect(pickShownSession([], "2026-10-02")).toBeNull();
  });

  it("A-12 treats a session today as upcoming", () => {
    const today = session({ id: "t", date: "2026-10-02" });
    expect(pickShownSession([today], "2026-10-02")?.isPast).toBe(false);
  });
});

describe("session formatters", () => {
  const timed = session({
    date: "2026-11-10",
    startTime: "07:30",
    endTime: "10:00",
    location: "Balairung UI, Depok",
  });

  it("formats the weekday date with and without a time", () => {
    expect(formatSessionWhen(timed)).toBe("Sel, 10 Nov 2026 · 07.30");
    expect(formatSessionWhen(session({ date: "2026-11-10" }))).toBe("Sel, 10 Nov 2026");
  });

  it("formats the full range and drops the missing parts", () => {
    expect(formatSessionRange(timed)).toBe("Sel, 10 Nov 2026 · 07.30–10.00 · Balairung UI, Depok");
    expect(
      formatSessionRange(
        session({
          date: "2026-11-10",
          startTime: "06:30",
          endTime: "07:15",
          location: "Rumah Rina, Depok",
        }),
      ),
    ).toBe("Sel, 10 Nov 2026 · 06.30–07.15 · Rumah Rina, Depok");
    expect(formatSessionRange(session({ date: "2026-11-10", startTime: "06:30" }))).toBe(
      "Sel, 10 Nov 2026 · 06.30",
    );
    expect(formatSessionRange(session({ date: "2026-11-10", location: "Depok" }))).toBe(
      "Sel, 10 Nov 2026 · Depok",
    );
  });

  it("formats the short date", () => {
    expect(formatShortDate("2026-11-10")).toBe("10 Nov 2026");
    expect(formatShortDate("2026-10-02")).toBe("2 Okt 2026");
  });
});
