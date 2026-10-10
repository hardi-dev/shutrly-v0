import type { FormattingLocale } from "@/shared/locale/locale.types";

import { formatIdrNumber, parseIdrAmount } from "../idr-amount/idr-amount";
import { formatQuantity, parseQuantity } from "../package-value/package-value";

/**
 * Rewrites a typed amount in the other language when the switch changes it (AC-L10N-004). It is
 * rewritten only when it parses under the old locale; anything else is kept as typed, so no input
 * is ever silently reinterpreted (D-19).
 * @param raw - the text in the field
 * @param from - the locale it was typed in
 * @param to - the locale it is shown in after the switch
 * @returns the amount grouped for `to`, or the raw text when it does not parse
 */
export function reformatAmountInput(
  raw: string,
  from: FormattingLocale,
  to: FormattingLocale,
): string {
  const parsed = parseIdrAmount(raw, from);
  return parsed.ok ? formatIdrNumber(parsed.amount, to) : raw;
}

/**
 * Rewrites a typed quantity in the other language's decimal separator when the switch changes it
 * (AC-L10N-004). Rewritten only when it parses under the old locale; otherwise kept as typed (D-19).
 * @param raw - the text in the field
 * @param from - the locale it was typed in
 * @param to - the locale it is shown in after the switch
 * @returns the quantity with the decimal separator of `to`, or the raw text when it does not parse
 */
export function reformatQuantityInput(
  raw: string,
  from: FormattingLocale,
  to: FormattingLocale,
): string {
  const parsed = parseQuantity(raw, from);
  return parsed.ok ? formatQuantity(parsed.value, to) : raw;
}
