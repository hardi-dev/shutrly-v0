import type {
  PackageValue,
  PackageValueIssue,
  QuantityResult,
  ValueRules,
} from "./package-value.types";

export const QUANTITY_MAX = "999999.99";

/** Parses a non-negative quantity typed with a comma or dot decimal separator (BR-CAT-001). @param raw - untrusted input @returns the canonical decimal string or a problem */
export function parseQuantity(raw: string): QuantityResult {
  const text = raw.trim();
  if (text.startsWith("-")) return { ok: false, problem: "NEGATIVE" };
  const separator = text.includes(",") ? "," : ".";
  const parts = text.split(separator);
  if (parts.length > 2) return { ok: false, problem: "INVALID" };
  const wholeText = parts[0] ?? "";
  const fractionText = parts.length === 2 ? (parts[1] ?? "") : "";
  if (!isDigits(wholeText) || (parts.length === 2 && !isDigits(fractionText))) {
    return { ok: false, problem: "INVALID" };
  }
  const whole = stripLeadingZeros(wholeText);
  const fraction = stripTrailingZeros(fractionText);
  if (fraction.length > 2) return { ok: false, problem: "TOO_MANY_DECIMALS" };
  const value = fraction.length > 0 ? `${whole}.${fraction}` : whole;
  if (compareDecimal(value, QUANTITY_MAX) > 0) return { ok: false, problem: "TOO_LARGE" };
  return { ok: true, value };
}

/** Compares two canonical non-negative decimal strings without floats. @param a - left @param b - right @returns -1, 0 or 1 */
export function compareDecimal(a: string, b: string): -1 | 0 | 1 {
  const [aw = "0", af = ""] = a.split(".");
  const [bw = "0", bf = ""] = b.split(".");
  if (aw.length !== bw.length) return aw.length > bw.length ? 1 : -1;
  const width = Math.max(af.length, bf.length);
  const left = aw + af.padEnd(width, "0");
  const right = bw + bf.padEnd(width, "0");
  if (left === right) return 0;
  return left > right ? 1 : -1;
}

/** Checks a package value against its definition (BR-CAT-001, BR-CAT-002). @param rules - the definition's value rules @param value - parsed value @returns the first issue or null */
export function findPackageValueProblem(
  rules: ValueRules,
  value: PackageValue,
): PackageValueIssue | null {
  if (value.type !== rules.valueType) return { field: "value", problem: "INVALID" };
  if (value.type === "NUMBER") {
    return rules.selectionRequired && value.value.includes(".")
      ? { field: "value", problem: "NOT_WHOLE" }
      : null;
  }
  return compareDecimal(value.min, value.max) > 0
    ? { field: "max", problem: "MIN_GREATER_THAN_MAX" }
    : null;
}

/** Formats a canonical decimal for Indonesian display (comma decimals). @param value - canonical decimal @returns the display string */
export function formatQuantity(value: string): string {
  return value.replace(".", ",");
}

function isDigits(value: string): boolean {
  return (
    value.length > 0 && Array.from(value).every((character) => character >= "0" && character <= "9")
  );
}

function stripLeadingZeros(value: string): string {
  let start = 0;
  while (start < value.length - 1 && value[start] === "0") start += 1;
  return value.slice(start);
}

function stripTrailingZeros(value: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === "0") end -= 1;
  return value.slice(0, end);
}
