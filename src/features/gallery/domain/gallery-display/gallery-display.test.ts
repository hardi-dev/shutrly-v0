import { describe, expect, it } from "vitest";

import {
  formatGalleryDate,
  formatGalleryDateAndTime,
  formatGalleryDateTime,
  formatGalleryShortDate,
  formatGalleryShortDateTime,
  formatGalleryTime,
} from "./gallery-display";

describe("gallery display", () => {
  it("A-4 shows the day and time in Asia/Jakarta", () => {
    expect(formatGalleryDate("2026-12-31T16:59:59.999Z", "id-ID")).toBe("Kam, 31 Des 2026");
    expect(formatGalleryDateTime("2026-10-04T03:12:00Z", "id-ID")).toBe("Min, 4 Okt 2026 · 10.12");
  });

  it("A-4 shortens the date for phone rows", () => {
    expect(formatGalleryTime("2026-10-04T03:12:00Z", "id-ID")).toBe("10.12");
    expect(formatGalleryShortDateTime("2026-10-04T03:12:00Z", "id-ID")).toBe("4 Okt 2026 · 10.12");
  });

  it("A-34 shows the day without the weekday, and with the time, in Asia/Jakarta", () => {
    // 2026-10-05 07:20 UTC is 14.20 in Jakarta.
    expect(formatGalleryShortDate("2026-10-05T07:20:00Z", "id-ID")).toBe("5 Okt 2026");
    expect(formatGalleryDateAndTime("2026-10-05T07:20:00Z", "id-ID")).toBe("5 Okt 2026, 14.20");
  });

  it("AC-L10N-005 en-US uses the same instant and time zone, with a 24-hour clock", () => {
    // 17:30 UTC is 00:30 on 3 Nov in Asia/Jakarta, so the calendar day is the Jakarta day.
    expect(formatGalleryDate("2026-11-02T17:30:00Z", "en-US")).toBe("Tue, Nov 3, 2026");
    expect(formatGalleryTime("2026-11-02T17:30:00Z", "en-US")).toBe("00:30");
  });

  it("AC-L10N-005 Asia/Jakarta midnight boundary stays on the same calendar day in both locales", () => {
    // 16:59:59 UTC is still 23:59:59 on 2 Nov in Jakarta.
    expect(formatGalleryDate("2026-11-02T16:59:59Z", "en-US")).toBe("Mon, Nov 2, 2026");
    expect(formatGalleryDate("2026-11-02T16:59:59Z", "id-ID")).toBe("Sen, 2 Nov 2026");
  });
});
