import { formatQuantity } from "../package-value/package-value";
import type { PackageValue } from "../package-value/package-value.types";
import type { SummaryItem } from "./item-summary.types";

/** Summarises the first package items for a compact service row (AC-CAT-005). @param items - service item values @param max - maximum number of values @returns the joined summary */
export function summariseServiceItems(items: readonly SummaryItem[], max = 3): string {
  return items.slice(0, max).map(formatSummaryItem).join(" · ");
}

function formatSummaryItem(item: SummaryItem): string {
  const value = formatValue(item.value);
  const unit = item.unit ?? item.name.toLowerCase();
  return `${value} ${unit}`;
}

function formatValue(value: PackageValue): string {
  return value.type === "NUMBER"
    ? formatQuantity(value.value)
    : `${formatQuantity(value.min)}–${formatQuantity(value.max)}`;
}
