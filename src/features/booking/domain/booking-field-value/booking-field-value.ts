import { isRealIsoDate } from "../session/calendar-date";
import type {
  BookingValue,
  BookingValueProblem,
  BookingValueResult,
  FieldValuesResult,
  SnapshotField,
} from "./booking-field-value.types";

export const BOOKING_TEXT_MAX_LENGTH = 200;
export const BOOKING_TEXTAREA_MAX_LENGTH = 2000;

const NUMBER_PATTERN = /^-?\d+(?:[.,]\d+)?$/;
const isBlank = (raw: BookingValue) =>
  raw === null || (typeof raw === "string" && raw.trim() === "");

function parseText(field: SnapshotField, raw: BookingValue): BookingValueResult {
  if (typeof raw !== "string") return { ok: false, problem: "INVALID" };
  const max = field.fieldType === "TEXT" ? BOOKING_TEXT_MAX_LENGTH : BOOKING_TEXTAREA_MAX_LENGTH;
  const text = raw.trim();
  return Array.from(text).length > max
    ? { ok: false, problem: "TOO_LONG" }
    : { ok: true, value: text };
}

/** Parses one booking value against its snapshotted field (A-3). @param field - snapshotted metadata @param raw - untrusted value @returns the stored value or a problem */
export function parseBookingValue(field: SnapshotField, raw: BookingValue): BookingValueResult {
  if (isBlank(raw))
    return field.isRequired ? { ok: false, problem: "REQUIRED" } : { ok: true, value: null };
  switch (field.fieldType) {
    case "TEXT":
    case "TEXTAREA":
      return parseText(field, raw);
    case "NUMBER":
      return typeof raw === "string" && NUMBER_PATTERN.test(raw.trim())
        ? { ok: true, value: raw.trim().replace(",", ".") }
        : { ok: false, problem: "INVALID" };
    case "DATE":
      return typeof raw === "string" && isRealIsoDate(raw)
        ? { ok: true, value: raw }
        : { ok: false, problem: "INVALID" };
    case "BOOLEAN":
      return typeof raw === "boolean"
        ? { ok: true, value: raw }
        : { ok: false, problem: "INVALID" };
    case "SELECT":
      return typeof raw === "string" && (field.options ?? []).includes(raw)
        ? { ok: true, value: raw }
        : { ok: false, problem: "NOT_AN_OPTION" };
  }
}

/** Validates every snapshotted field at once; unknown keys are ignored (BR-PRJ-002). @param fields - snapshotted fields in order @param raw - untrusted values by key @returns the stored values and every problem */
export function validateFieldValues(
  fields: readonly SnapshotField[],
  raw: Readonly<Record<string, BookingValue>>,
): FieldValuesResult {
  const values: Record<string, BookingValue> = {};
  const problems: Record<string, BookingValueProblem> = {};
  for (const field of fields) {
    const result = parseBookingValue(field, raw[field.key] ?? null);
    if (result.ok) values[field.key] = result.value;
    else problems[field.key] = result.problem;
  }
  return { values, problems };
}
