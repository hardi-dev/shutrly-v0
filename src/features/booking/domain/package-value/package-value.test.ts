import { describe, expect, it } from "vitest";

import {
  compareDecimal,
  findPackageValueProblem,
  formatQuantity,
  localizePackageValue,
  parseQuantity,
  QUANTITY_MAX,
} from "./package-value";

describe("package values (BR-CAT-001, BR-CAT-002)", () => {
  it.each([
    ["25", "25"],
    ["1,5", "1.5"],
    ["1,50", "1.5"],
    [" 0 ", "0"],
  ])("AC-CAT-011 parses %j as %s in id-ID", (raw, value) => {
    expect(parseQuantity(raw, "id-ID")).toEqual({ ok: true, value });
  });

  it.each([
    ["25", "25"],
    ["1.5", "1.5"],
    ["1.50", "1.5"],
    [" 0 ", "0"],
  ])("AC-L10N-005 parses %j as %s in en-US", (raw, value) => {
    expect(parseQuantity(raw, "en-US")).toEqual({ ok: true, value });
  });

  it("C-105 id-ID refuses a dot decimal", () => {
    expect(parseQuantity("1.5", "id-ID")).toEqual({ ok: false, problem: "INVALID" });
  });

  it("C-105 en-US refuses a comma decimal", () => {
    expect(parseQuantity("1,5", "en-US")).toEqual({ ok: false, problem: "INVALID" });
  });

  it.each(["id-ID", "en-US"] as const)(
    "AC-L10N-005 parse(format(v, %s), %s) returns v for 0, 0.5, 12.25 and QUANTITY_MAX",
    (locale) => {
      for (const value of ["0", "0.5", "12.25", QUANTITY_MAX]) {
        expect(parseQuantity(formatQuantity(value, locale), locale)).toEqual({ ok: true, value });
      }
    },
  );

  it.each([
    ["", "INVALID"],
    ["abc", "INVALID"],
    ["-1", "NEGATIVE"],
    ["1,234", "TOO_MANY_DECIMALS"],
    ["1000000", "TOO_LARGE"],
  ])("AC-CAT-012 rejects %j with %s in id-ID", (raw, problem) => {
    expect(parseQuantity(raw, "id-ID")).toEqual({ ok: false, problem });
  });

  it("BR-CAT-001 more than two decimals is still TOO_MANY_DECIMALS in en-US", () => {
    expect(parseQuantity("1.234", "en-US")).toEqual({ ok: false, problem: "TOO_MANY_DECIMALS" });
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
    expect(formatQuantity("1.5", "id-ID")).toBe("1,5");
    expect(formatQuantity("1.5", "en-US")).toBe("1.5");
  });

  it("AC-L10N-005 a stored value is shown in the active locale's decimal separator", () => {
    expect(localizePackageValue({ type: "NUMBER", value: "1.5" }, "id-ID")).toEqual({
      type: "NUMBER",
      value: "1,5",
    });
    expect(localizePackageValue({ type: "RANGE", min: "1.5", max: "2" }, "en-US")).toEqual({
      type: "RANGE",
      min: "1.5",
      max: "2",
    });
  });
});
