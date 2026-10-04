import { describe, expect, it } from "vitest";

import {
  endOfGalleryDay,
  expiryOnPublish,
  resolveExpiry,
  todayInGalleryZone,
} from "./gallery-expiry";

describe("resolveExpiry", () => {
  it("AC-GAL-018 keeps a duration on a draft until publish", () => {
    const now = new Date("2026-10-04T03:00:00Z");
    expect(resolveExpiry({ type: "DAYS", days: 30 }, "DRAFT", now)).toEqual({
      ok: true,
      expiry: { expiresAt: null, expiryDays: 30 },
    });
  });

  it("AC-GAL-018 counts a duration from now on a published gallery", () => {
    const now = new Date("2026-10-10T02:00:00Z");
    expect(resolveExpiry({ type: "DAYS", days: 7 }, "PUBLISHED", now)).toEqual({
      ok: true,
      expiry: { expiresAt: new Date("2026-10-17T02:00:00Z"), expiryDays: null },
    });
  });

  it("AC-GAL-019 expires at the end of the chosen day in Asia/Jakarta", () => {
    const now = new Date("2026-10-04T03:00:00Z");
    const result = resolveExpiry({ type: "DATE", date: "2026-12-31" }, "PUBLISHED", now);
    expect(result).toEqual({
      ok: true,
      expiry: { expiresAt: new Date("2026-12-31T16:59:59.999Z"), expiryDays: null },
    });
  });

  it("AC-GAL-019 accepts today and refuses a day before today", () => {
    // 2026-10-04 23:30 in Jakarta is 16:30 UTC.
    const now = new Date("2026-10-04T16:30:00Z");
    expect(resolveExpiry({ type: "DATE", date: "2026-10-04" }, "DRAFT", now).ok).toBe(true);
    expect(resolveExpiry({ type: "DATE", date: "2026-10-03" }, "DRAFT", now)).toEqual({
      ok: false,
      code: "PAST_DATE",
    });
  });

  it("AC-GAL-019 removes the expiry", () => {
    expect(resolveExpiry({ type: "NONE" }, "EXPIRED", new Date())).toEqual({
      ok: true,
      expiry: { expiresAt: null, expiryDays: null },
    });
  });
});

describe("expiryOnPublish", () => {
  it("AC-GAL-018 turns 30 days into publish time + 30 days", () => {
    const publishedAt = new Date("2026-10-04T03:00:00Z");
    const stored = { status: "DRAFT" as const, expiresAt: null, expiryDays: 30 };
    expect(expiryOnPublish(stored, publishedAt)).toEqual({
      expiresAt: new Date("2026-11-03T03:00:00Z"),
      expiryDays: null,
    });
  });

  it("BR-GAL-005 keeps a date or no expiry unchanged", () => {
    const date = endOfGalleryDay("2026-12-31");
    expect(
      expiryOnPublish({ status: "DRAFT", expiresAt: date, expiryDays: null }, new Date()),
    ).toEqual({ expiresAt: date, expiryDays: null });
  });
});

describe("todayInGalleryZone", () => {
  it("A-4 reads the day in Asia/Jakarta", () => {
    expect(todayInGalleryZone(new Date("2026-10-04T17:00:00Z"))).toBe("2026-10-05");
  });
});
