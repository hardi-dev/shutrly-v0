import { describe, expect, it } from "vitest";

import { galleryExpirySchema } from "./gallery-expiry.schema";

describe("galleryExpirySchema (A-1, AC-GFL-011)", () => {
  it.each([7, 14, 30, 60, 90])("AC-GFL-010 accepts the %i-day preset", (days) => {
    expect(galleryExpirySchema.safeParse({ type: "DAYS", days }).success).toBe(true);
  });

  it.each([0, 6, 45, 3650])("AC-GFL-011 refuses %i days, which is not a preset", (days) => {
    expect(galleryExpirySchema.safeParse({ type: "DAYS", days }).success).toBe(false);
  });

  it("AC-GFL-011 refuses a fractional number of days", () => {
    expect(galleryExpirySchema.safeParse({ type: "DAYS", days: 7.5 }).success).toBe(false);
  });
});
