import { describe, expect, it } from "vitest";

import { fieldKeyFromName, findOptionsProblem, uniqueFieldKey } from "./booking-field";

describe("booking fields (BR-CAT-006, A-3)", () => {
  it("AC-CAT-014 derives stable keys", () => {
    expect(fieldKeyFromName("Nama kampus")).toBe("nama_kampus");
    expect(fieldKeyFromName("Tanggal  wisuda!")).toBe("tanggal_wisuda");
    expect(fieldKeyFromName("Ãlamat Rumah")).toBe("alamat_rumah");
    expect(fieldKeyFromName("123")).toBe("field_123");
    expect(fieldKeyFromName("!!!")).toBe("field");
    expect(uniqueFieldKey("nama_kampus", ["nama_kampus", "nama_kampus_2"])).toBe("nama_kampus_3");
  });

  it.each([
    [[], { problem: "OPTIONS_REQUIRED" }],
    [["S", " "], { problem: "OPTION_EMPTY", index: 1 }],
    [["S", "M", "s"], { problem: "OPTION_DUPLICATE", index: 2 }],
    [["a".repeat(61)], { problem: "OPTION_TOO_LONG", index: 0 }],
    [Array.from({ length: 51 }, (_, i) => `o${String(i)}`), { problem: "TOO_MANY_OPTIONS" }],
    [["S", "M", "L"], null],
  ])("AC-CAT-015 options %j → %j", (options, problem) => {
    expect(findOptionsProblem(options)).toEqual(problem);
  });
});
