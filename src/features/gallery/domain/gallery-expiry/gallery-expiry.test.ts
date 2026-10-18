import { describe, expect, it } from "vitest";

import {
  GALLERY_EXPIRY_PRESETS,
  isExpiryPreset,
  resolveExpiry,
  todayInGalleryZone,
} from "./gallery-expiry";

describe("resolveExpiry (BR-GAL-005, A-1, A-2)", () => {
  it("AC-GFL-010 counts a preset duration from the save time", () => {
    const now = new Date("2026-10-10T02:00:00Z");
    expect(resolveExpiry({ type: "DAYS", days: 7 }, now)).toEqual({
      ok: true,
      expiry: { expiresAt: new Date("2026-10-17T02:00:00Z"), expiryDays: null },
    });
  });

  it("AC-GFL-010 counts a 14-day preset from the save time", () => {
    const now = new Date("2026-10-10T02:00:00Z");
    expect(resolveExpiry({ type: "DAYS", days: 14 }, now)).toEqual({
      ok: true,
      expiry: { expiresAt: new Date("2026-10-24T02:00:00Z"), expiryDays: null },
    });
  });

  it("AC-GFL-012 expires a later date at the end of that day in Asia/Jakarta", () => {
    const now = new Date("2026-10-04T03:00:00Z");
    expect(resolveExpiry({ type: "DATE", date: "2026-12-31" }, now)).toEqual({
      ok: true,
      expiry: { expiresAt: new Date("2026-12-31T16:59:59.999Z"), expiryDays: null },
    });
  });

  it("AC-GFL-012 choosing today closes the gallery at the save time", () => {
    // 2026-10-04 23:30 in Jakarta is 16:30 UTC.
    const now = new Date("2026-10-04T16:30:00Z");
    expect(resolveExpiry({ type: "DATE", date: "2026-10-04" }, now)).toEqual({
      ok: true,
      expiry: { expiresAt: now, expiryDays: null },
    });
  });

  it("AC-GFL-011 refuses a day before today", () => {
    const now = new Date("2026-10-04T16:30:00Z");
    expect(resolveExpiry({ type: "DATE", date: "2026-10-03" }, now)).toEqual({
      ok: false,
      code: "PAST_DATE",
    });
  });

  it("AC-GFL-012 removes the expiry", () => {
    expect(resolveExpiry({ type: "NONE" }, new Date())).toEqual({
      ok: true,
      expiry: { expiresAt: null, expiryDays: null },
    });
  });
});

describe("isExpiryPreset (A-1, AC-GFL-011)", () => {
  it("AC-GFL-010 accepts exactly 7, 14, 30, 60 and 90 days", () => {
    expect(GALLERY_EXPIRY_PRESETS).toEqual([7, 14, 30, 60, 90]);
    expect([7, 14, 30, 60, 90].every(isExpiryPreset)).toBe(true);
  });

  it("AC-GFL-011 refuses any other duration", () => {
    expect([1, 6, 8, 45, 91, 3650].some(isExpiryPreset)).toBe(false);
  });
});

describe("todayInGalleryZone", () => {
  it("A-4 reads the day in Asia/Jakarta", () => {
    expect(todayInGalleryZone(new Date("2026-10-04T17:00:00Z"))).toBe("2026-10-05");
  });
});
