import { describe, expect, it } from "vitest";

import { canonicalIdrAmount, formatIdr, parseIdrAmount } from "./idr-amount";

describe("IDR amounts (BR-CUR-001, BR-CUR-003, ADR-007)", () => {
  it.each([
    ["750000", "750000"],
    ["750.000", "750000"],
    ["Rp 750.000", "750000"],
    ["0", "0"],
    ["999.999.999.999", "999999999999"],
  ])("AC-CAT-010 parses %j as %s", (raw, amount) => {
    expect(parseIdrAmount(raw)).toEqual({ ok: true, amount });
  });

  it.each([
    ["", "EMPTY"],
    ["7,5", "NOT_WHOLE"],
    ["-5", "INVALID"],
    ["1.000.000.000.000", "TOO_LARGE"],
  ])("AC-CAT-010 rejects %j with %s", (raw, problem) => {
    expect(parseIdrAmount(raw)).toEqual({ ok: false, problem });
  });

  it("AC-CAT-005 formats whole rupiah", () => {
    expect(formatIdr("750000")).toBe("Rp 750.000");
    expect(formatIdr("12000000")).toBe("Rp 12.000.000");
  });

  it.each([
    ["750000.000", "750000"],
    ["0.000", "0"],
    ["1200.500", "1200.500"],
  ])("normalizes database value %s to %s", (raw, expected) => {
    expect(canonicalIdrAmount(raw)).toBe(expected);
  });
});
