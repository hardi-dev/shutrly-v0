import { describe, expect, it } from "vitest";

import {
  BOOKING_TEXT_MAX_LENGTH,
  BOOKING_TEXTAREA_MAX_LENGTH,
  parseBookingValue,
  validateFieldValues,
} from "./booking-field-value";
import type { SnapshotField } from "./booking-field-value.types";

const field = (overrides: Partial<SnapshotField>): SnapshotField => ({
  key: "k",
  name: "Field",
  fieldType: "TEXT",
  isRequired: false,
  options: null,
  ...overrides,
});

const campus = field({ key: "nama_kampus", name: "Nama kampus", isRequired: true });
const date = field({
  key: "tanggal_wisuda",
  name: "Tanggal wisuda",
  fieldType: "DATE",
  isRequired: true,
});
const toga = field({
  key: "ukuran_toga",
  name: "Ukuran toga",
  fieldType: "SELECT",
  options: ["S", "M", "L"],
});

describe("booking field values (A-3, BR-PRJ-002)", () => {
  it("AC-PRJ-010 requires required fields and nulls empty optional ones", () => {
    expect(parseBookingValue(campus, "  ")).toEqual({ ok: false, problem: "REQUIRED" });
    expect(parseBookingValue(campus, null)).toEqual({ ok: false, problem: "REQUIRED" });
    expect(parseBookingValue(toga, "")).toEqual({ ok: true, value: null });
  });

  it("A-3 trims text and enforces the length limits", () => {
    expect(parseBookingValue(campus, " UI ")).toEqual({ ok: true, value: "UI" });
    expect(parseBookingValue(campus, "a".repeat(BOOKING_TEXT_MAX_LENGTH + 1))).toEqual({
      ok: false,
      problem: "TOO_LONG",
    });
    const area = field({ fieldType: "TEXTAREA" });
    expect(parseBookingValue(area, "a".repeat(BOOKING_TEXTAREA_MAX_LENGTH))).toMatchObject({
      ok: true,
    });
    expect(parseBookingValue(area, "a".repeat(BOOKING_TEXTAREA_MAX_LENGTH + 1))).toEqual({
      ok: false,
      problem: "TOO_LONG",
    });
    expect(parseBookingValue(campus, true)).toEqual({ ok: false, problem: "INVALID" });
  });

  it("A-3 stores numbers as canonical decimal strings", () => {
    const number = field({ fieldType: "NUMBER" });
    expect(parseBookingValue(number, "12,5")).toEqual({ ok: true, value: "12.5" });
    expect(parseBookingValue(number, "-3")).toEqual({ ok: true, value: "-3" });
    expect(parseBookingValue(number, "abc")).toEqual({ ok: false, problem: "INVALID" });
  });

  it("A-3 accepts only real ISO dates, booleans and listed options", () => {
    expect(parseBookingValue(date, "2026-06-20")).toEqual({ ok: true, value: "2026-06-20" });
    expect(parseBookingValue(date, "2026-02-30")).toEqual({ ok: false, problem: "INVALID" });
    const flag = field({ fieldType: "BOOLEAN" });
    expect(parseBookingValue(flag, false)).toEqual({ ok: true, value: false });
    expect(parseBookingValue(flag, "true")).toEqual({ ok: false, problem: "INVALID" });
    expect(parseBookingValue(toga, "M")).toEqual({ ok: true, value: "M" });
    expect(parseBookingValue(toga, "XL")).toEqual({ ok: false, problem: "NOT_AN_OPTION" });
  });

  it("AC-PRJ-010 collects every problem and ignores unknown keys", () => {
    const result = validateFieldValues([campus, date, toga], { ukuran_toga: "XL", extra: "x" });
    expect(result.problems).toEqual({
      nama_kampus: "REQUIRED",
      tanggal_wisuda: "REQUIRED",
      ukuran_toga: "NOT_AN_OPTION",
    });
    expect(result.values).toEqual({});
    const ok = validateFieldValues([campus, toga], { nama_kampus: "UI" });
    expect(ok.values).toEqual({ nama_kampus: "UI", ukuran_toga: null });
    expect(ok.problems).toEqual({});
  });
});
