import type { FieldType } from "../booking-field/booking-field.types";

export type BookingValue = string | boolean | null;
export interface SnapshotField {
  readonly key: string;
  readonly name: string;
  readonly fieldType: FieldType;
  readonly isRequired: boolean;
  readonly options: readonly string[] | null;
}
export type BookingValueProblem = "REQUIRED" | "INVALID" | "TOO_LONG" | "NOT_AN_OPTION";
export type BookingValueResult =
  | { readonly ok: true; readonly value: BookingValue }
  | { readonly ok: false; readonly problem: BookingValueProblem };
export interface FieldValuesResult {
  readonly values: Readonly<Record<string, BookingValue>>;
  readonly problems: Readonly<Record<string, BookingValueProblem>>;
}
