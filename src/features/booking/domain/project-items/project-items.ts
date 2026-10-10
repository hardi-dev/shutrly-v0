import type { FormattingLocale } from "@/shared/locale/locale.types";

import { findPackageValueProblem, parseQuantity } from "../package-value/package-value";
import type { PackageValue, ValueRules } from "../package-value/package-value.types";
import type { ItemListProblem, ItemListResult, ProjectItemInput } from "./project-items.types";

type ParsedValue =
  | { readonly ok: true; readonly value: PackageValue }
  | { readonly ok: false; readonly field: string; readonly problem: ItemListProblem };

function parseValue(rules: ValueRules, raw: PackageValue, locale: FormattingLocale): ParsedValue {
  if (raw.type !== rules.valueType) return { ok: false, field: "value", problem: "INVALID" };
  let value: PackageValue;
  if (raw.type === "NUMBER") {
    const quantity = parseQuantity(raw.value, locale);
    if (!quantity.ok) return { ok: false, field: "value", problem: quantity.problem };
    value = { type: "NUMBER", value: quantity.value };
  } else {
    const min = parseQuantity(raw.min, locale);
    if (!min.ok) return { ok: false, field: "min", problem: min.problem };
    const max = parseQuantity(raw.max, locale);
    if (!max.ok) return { ok: false, field: "max", problem: max.problem };
    value = { type: "RANGE", min: min.value, max: max.value };
  }
  const issue = findPackageValueProblem(rules, value);
  return issue ? { ok: false, field: issue.field, problem: issue.problem } : { ok: true, value };
}

/** Validates a project's package items against their definitions, collecting every problem (AC-PRJ-017). @param items - submitted items in order @param rules - value rules by definition id @returns canonical values and errors keyed items.N.* */
export function validateItemList(
  items: readonly ProjectItemInput[],
  rules: Readonly<Partial<Record<string, ValueRules>>>,
  locale: FormattingLocale,
): ItemListResult {
  const errors: Record<string, ItemListProblem> = {};
  const seen = new Set<string>();
  const values = items.map((item, index) => {
    const itemRules = rules[item.definitionId];
    if (itemRules === undefined) {
      errors[`items.${String(index)}.definitionId`] = "INVALID";
      return null;
    }
    if (seen.has(item.definitionId)) {
      errors[`items.${String(index)}.definitionId`] = "DUPLICATE_DEFINITION";
      return null;
    }
    seen.add(item.definitionId);
    const parsed = parseValue(itemRules, item.value, locale);
    if (parsed.ok) return parsed.value;
    errors[`items.${String(index)}.${parsed.field}`] = parsed.problem;
    return null;
  });
  return { values, errors };
}
