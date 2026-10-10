import { describe, expect, it } from "vitest";

import { summariseServiceItems } from "./item-summary";

describe("service item summaries (AC-CAT-005)", () => {
  it("formats up to three package values", () => {
    expect(
      summariseServiceItems(
        [
          { name: "Foto edit", unit: "foto", value: { type: "NUMBER", value: "25" } },
          { name: "Foto cetak", unit: "lembar", value: { type: "NUMBER", value: "5" } },
          { name: "Jumlah orang", unit: "orang", value: { type: "RANGE", min: "1", max: "2" } },
          { name: "Durasi pemotretan", unit: "jam", value: { type: "NUMBER", value: "4" } },
        ],
        "id-ID",
      ),
    ).toBe("25 foto · 5 lembar · 1–2 orang");
  });

  it("falls back to the lower-cased definition name when there is no unit", () => {
    expect(
      summariseServiceItems(
        [{ name: "Album", unit: null, value: { type: "NUMBER", value: "2" } }],
        "id-ID",
      ),
    ).toBe("2 album");
  });
});
