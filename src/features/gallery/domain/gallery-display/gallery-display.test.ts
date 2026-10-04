import { describe, expect, it } from "vitest";

import { formatGalleryDate, formatGalleryDateTime } from "./gallery-display";

describe("gallery display", () => {
  it("A-4 shows the day and time in Asia/Jakarta", () => {
    expect(formatGalleryDate("2026-12-31T16:59:59.999Z")).toBe("Kam, 31 Des 2026");
    expect(formatGalleryDateTime("2026-10-04T03:12:00Z")).toBe("Min, 4 Okt 2026 · 10.12");
  });
});
