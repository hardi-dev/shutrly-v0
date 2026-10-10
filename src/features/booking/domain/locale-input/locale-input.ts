import type { FormattingLocale } from "@/shared/locale/locale.types";

import { formatIdrNumber, parseIdrAmount } from "../idr-amount/idr-amount";

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
