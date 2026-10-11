import { copyTranslator } from "@tests/support/copy/copy-messages";
import { describe, expect, it } from "vitest";

import type { ProjectFieldRecord } from "@/features/booking/application/ports/project-repository/project-repository.port";

import { PROJECT_COPY_NAMESPACE } from "../project-copy/project-copy.copy";
import { displayBookingValue } from "./booking-value-display";

const t = copyTranslator(PROJECT_COPY_NAMESPACE, "id");

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
    expect(displayBookingValue(t, field({}), "id-ID")).toBe("UI");
    expect(displayBookingValue(t, field({ fieldType: "DATE", value: "2026-11-10" }), "id-ID")).toBe(
      "Sel, 10 Nov 2026",
    );
  });

  it("AC-PRJ-015 shows booleans as Ya or Tidak and empty values as null", () => {
    expect(displayBookingValue(t, field({ fieldType: "BOOLEAN", value: true }), "id-ID")).toBe(
      "Ya",
    );
    expect(displayBookingValue(t, field({ fieldType: "BOOLEAN", value: false }), "id-ID")).toBe(
      "Tidak",
    );
    expect(displayBookingValue(t, field({ value: null }), "id-ID")).toBeNull();
    expect(displayBookingValue(t, field({ value: "" }), "id-ID")).toBeNull();
  });
});
