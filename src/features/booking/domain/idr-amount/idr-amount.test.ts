import { describe, expect, it } from "vitest";

import type { FormattingLocale } from "@/shared/locale/locale.types";

import { canonicalIdrAmount, formatIdr, formatIdrNumber, parseIdrAmount } from "./idr-amount";

const LOCALES: readonly FormattingLocale[] = ["id-ID", "en-US"];
const BOUNDARY = ["0", "1", "999", "1000", "1500000", "999999999999"];

describe("IDR amounts (BR-CUR-001, BR-CUR-003, ADR-007)", () => {
  it.each([
    ["750000", "750000"],
    ["0", "0"],
    ["999999999999", "999999999999"],
  ])("AC-CAT-010 parses %j as %s in id-ID", (raw, amount) => {
    expect(parseIdrAmount(raw, "id-ID")).toEqual({ ok: true, amount });
  });

  it.each([
    ["750.000", "750000"],
    ["Rp 750.000", "750000"],
    ["999.999.999.999", "999999999999"],
  ])("AC-CAT-010 parses %j as %s in id-ID with dot grouping", (raw, amount) => {
    expect(parseIdrAmount(raw, "id-ID")).toEqual({ ok: true, amount });
  });

  it.each([
    ["", "EMPTY"],
    ["7,5", "NOT_WHOLE"],
    ["-5", "INVALID"],
    ["1.000.000.000.000", "TOO_LARGE"],
  ])("AC-CAT-010 rejects %j with %s in id-ID", (raw, problem) => {
    expect(parseIdrAmount(raw, "id-ID")).toEqual({ ok: false, problem });
  });

  it("AC-CAT-005 formats whole rupiah in id-ID", () => {
    expect(formatIdr("750000", "id-ID")).toBe("Rp 750.000");
    expect(formatIdr("12000000", "id-ID")).toBe("Rp 12.000.000");
  });

  it("AC-L10N-006 id-ID output is unchanged (Rp 750.000)", () => {
    expect(formatIdr("750000", "id-ID")).toBe("Rp 750.000");
    expect(formatIdrNumber("750000", "id-ID")).toBe("750.000");
  });

  it("AC-L10N-005 accepts the Rp and IDR prefixes in both locales", () => {
    expect(parseIdrAmount("Rp 750.000", "id-ID")).toEqual({ ok: true, amount: "750000" });
    expect(parseIdrAmount("IDR 750,000", "en-US")).toEqual({ ok: true, amount: "750000" });
    expect(parseIdrAmount("idr 750,000", "en-US")).toEqual({ ok: true, amount: "750000" });
  });

  it("C-105 id-ID: a comma is NOT_WHOLE, never a decimal", () => {
    expect(parseIdrAmount("750,5", "id-ID")).toEqual({ ok: false, problem: "NOT_WHOLE" });
  });

  it("C-105 en-US: a dot is NOT_WHOLE, never a decimal", () => {
    expect(parseIdrAmount("750.5", "en-US")).toEqual({ ok: false, problem: "NOT_WHOLE" });
  });

  it.each(LOCALES.flatMap((locale) => BOUNDARY.map((value) => [locale, value] as const)))(
    "AC-L10N-005 parse(format(v, %s), %s) returns %s exactly",
    (locale, value) => {
      expect(parseIdrAmount(formatIdr(value, locale), locale)).toEqual({ ok: true, amount: value });
    },
  );

  it("AC-CAT-005 formats the same instant in en-US with the decided pattern (D-20)", () => {
    expect(formatIdr("750000", "en-US")).toBe("IDR 750,000");
  });

  it.each([
    ["750000.000", "750000"],
    ["0.000", "0"],
    ["1200.500", "1200.500"],
  ])("normalizes database value %s to %s", (raw, expected) => {
    expect(canonicalIdrAmount(raw)).toBe(expected);
  });

  it("AC-PRJ-007 groups digits without the currency prefix", () => {
    expect(formatIdrNumber("750000", "id-ID")).toBe("750.000");
    expect(formatIdrNumber("0", "id-ID")).toBe("0");
  });
});
