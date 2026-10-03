import { describe, expect, it } from "vitest";

import type { ProjectFieldRecord } from "@/features/booking/application/ports/project-repository/project-repository.port";

import { displayBookingValue } from "./booking-value-display";

function field(overrides: Partial<ProjectFieldRecord>): ProjectFieldRecord {
  return {
    id: "f1",
    key: "k",
    name: "K",
    fieldType: "TEXT",
    isRequired: false,
    options: null,
    value: "UI",
    ...overrides,
  };
}

describe("booking value display", () => {
  it("AC-PRJ-015 shows text as is and dates with the weekday", () => {
    expect(displayBookingValue(field({}))).toBe("UI");
    expect(displayBookingValue(field({ fieldType: "DATE", value: "2026-11-10" }))).toBe(
      "Sel, 10 Nov 2026",
    );
  });

  it("AC-PRJ-015 shows booleans as Ya or Tidak and empty values as null", () => {
    expect(displayBookingValue(field({ fieldType: "BOOLEAN", value: true }))).toBe("Ya");
    expect(displayBookingValue(field({ fieldType: "BOOLEAN", value: false }))).toBe("Tidak");
    expect(displayBookingValue(field({ value: null }))).toBeNull();
    expect(displayBookingValue(field({ value: "" }))).toBeNull();
  });
});
