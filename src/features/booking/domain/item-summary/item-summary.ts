import type { FormattingLocale } from "@/shared/locale/locale.types";

import { formatQuantity } from "../package-value/package-value";
import type { PackageValue } from "../package-value/package-value.types";
import type { SummaryItem } from "./item-summary.types";

/** Summarises the first package items for a compact service row (AC-CAT-005). @param items - service item values @param max - maximum number of values @returns the joined summary */
export function summariseServiceItems(
  items: readonly SummaryItem[],
  locale: FormattingLocale,
  max = 3,
): string {
  return items
    .slice(0, max)
    .map((item) => formatSummaryItem(item, locale))
    .join(" · ");
}

function formatSummaryItem(item: SummaryItem, locale: FormattingLocale): string {
  const value = formatValue(item.value, locale);
  const unit = item.unit ?? item.name.toLowerCase();
  return `${value} ${unit}`;
}

function formatValue(value: PackageValue, locale: FormattingLocale): string {
  return value.type === "NUMBER"
    ? formatQuantity(value.value, locale)
    : `${formatQuantity(value.min, locale)}–${formatQuantity(value.max, locale)}`;
}
