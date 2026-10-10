import { describe, expect, it } from "vitest";

import {
  minutesUntilWindowEnds,
  PASSWORD_PER_TOKEN,
  PASSWORD_PER_TOKEN_AND_ADDRESS,
  UNKNOWN_TOKEN_PER_ADDRESS,
} from "./client-access-limits";

describe("client access limits (BR-ACC-004, A-2)", () => {
  it("AC-ACC-003 AC-ACC-005 keeps the agreed numbers", () => {
    expect(PASSWORD_PER_TOKEN_AND_ADDRESS).toEqual({ limit: 5, windowSeconds: 900 });
    expect(PASSWORD_PER_TOKEN).toEqual({ limit: 20, windowSeconds: 3600 });
    expect(UNKNOWN_TOKEN_PER_ADDRESS).toEqual({ limit: 30, windowSeconds: 3600 });
  });

  it("AC-ACC-003 counts the minutes left in the 15-minute window, rounded up", () => {
    const rule = PASSWORD_PER_TOKEN_AND_ADDRESS;
    expect(minutesUntilWindowEnds(rule, new Date("2026-10-06T10:00:00Z"))).toBe(15);
    expect(minutesUntilWindowEnds(rule, new Date("2026-10-06T10:13:30Z"))).toBe(2);
    expect(minutesUntilWindowEnds(rule, new Date("2026-10-06T10:14:59Z"))).toBe(1);
  });
});
