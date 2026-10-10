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
    expect(formatGalleryDate("2026-12-31T16:59:59.999Z")).toBe("Kam, 31 Des 2026");
    expect(formatGalleryDateTime("2026-10-04T03:12:00Z")).toBe("Min, 4 Okt 2026 · 10.12");
  });

  it("A-4 shortens the date for phone rows", () => {
    expect(formatGalleryTime("2026-10-04T03:12:00Z")).toBe("10.12");
    expect(formatGalleryShortDateTime("2026-10-04T03:12:00Z")).toBe("4 Okt 2026 · 10.12");
  });

  it("A-34 shows the day without the weekday, and with the time, in Asia/Jakarta", () => {
    // 2026-10-05 07:20 UTC is 14.20 in Jakarta.
    expect(formatGalleryShortDate("2026-10-05T07:20:00Z")).toBe("5 Okt 2026");
    expect(formatGalleryDateAndTime("2026-10-05T07:20:00Z")).toBe("5 Okt 2026, 14.20");
  });
});
