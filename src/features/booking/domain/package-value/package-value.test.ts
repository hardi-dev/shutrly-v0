import { describe, expect, it } from "vitest";

import {
  compareDecimal,
  findPackageValueProblem,
  formatQuantity,
  parseQuantity,
} from "./package-value";

describe("package values (BR-CAT-001, BR-CAT-002)", () => {
  it.each([
    ["25", "25"],
    ["1,5", "1.5"],
    ["1.50", "1.5"],
    [" 0 ", "0"],
  ])("AC-CAT-011 parses %j as %s", (raw, value) => {
    expect(parseQuantity(raw)).toEqual({ ok: true, value });
  });

  it.each([
    ["", "INVALID"],
    ["abc", "INVALID"],
    ["-1", "NEGATIVE"],
    ["1,234", "TOO_MANY_DECIMALS"],
    ["1000000", "TOO_LARGE"],
  ])("AC-CAT-012 rejects %j with %s", (raw, problem) => {
    expect(parseQuantity(raw)).toEqual({ ok: false, problem });
  });

  it("AC-CAT-012 a selection value must be whole and a range must be ordered", () => {
    const selection = { valueType: "NUMBER", selectionRequired: true } as const;
    const range = { valueType: "RANGE", selectionRequired: false } as const;
    expect(findPackageValueProblem(selection, { type: "NUMBER", value: "2.5" })).toEqual({
      field: "value",
      problem: "NOT_WHOLE",
    });
    expect(findPackageValueProblem(range, { type: "RANGE", min: "3", max: "2" })).toEqual({
      field: "max",
      problem: "MIN_GREATER_THAN_MAX",
    });
    expect(findPackageValueProblem(range, { type: "RANGE", min: "1", max: "2" })).toBeNull();
  });

  it("compares and formats decimals without floats", () => {
    expect(compareDecimal("10", "9.99")).toBe(1);
    expect(compareDecimal("2", "2.00")).toBe(0);
    expect(formatQuantity("1.5")).toBe("1,5");
  });
});
