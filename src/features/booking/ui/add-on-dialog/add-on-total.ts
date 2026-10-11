import { addOnTotal } from "@/features/booking/domain/add-on/add-on";
import { formatIdr, parseIdrAmount } from "@/features/booking/domain/idr-amount/idr-amount";
import type { FormattingLocale } from "@/shared/locale/locale.types";

/**
 * The dialog's live total from what is typed so far; anything not yet valid shows Rp 0. Display
 * only: the server computes the stored total (BR-ADD-006, C-004).
 * @param quantity - the typed quantity
 * @param unitPrice - the typed unit price
 * @returns e.g. "Rp 100.000"
 */
export function liveAddOnTotal(
  quantity: string | number,
  unitPrice: string,
  locale: FormattingLocale,
): string {
  const text = String(quantity).trim();
  const count = /^\d+$/.test(text) ? Number(text) : 0;
  const price = parseIdrAmount(unitPrice, locale);
  return formatIdr(price.ok ? addOnTotal(count, price.amount) : "0", locale);
}
