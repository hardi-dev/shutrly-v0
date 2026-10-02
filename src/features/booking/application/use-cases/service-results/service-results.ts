import "server-only";

import {
  findPackageValueProblem,
  parseQuantity,
} from "@/features/booking/domain/package-value/package-value";
import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";

import type { ItemDefinitionRecord } from "../../ports/item-definition-repository/item-definition-repository.port";
import { packageValueInputSchema } from "../../schemas/package-value-input/package-value-input.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { CatalogValidationFailure } from "../catalog-results/catalog-results.types";

export function parsePackageValue(
  input: unknown,
  definition: ItemDefinitionRecord,
): { readonly ok: true; readonly value: PackageValue } | CatalogValidationFailure {
  const parsed = packageValueInputSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  if (parsed.data.type !== definition.valueType) {
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { value: "INVALID" } };
  }
  if (parsed.data.type === "NUMBER") {
    const quantity = parseQuantity(parsed.data.value);
    if (!quantity.ok)
      return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { value: quantity.problem } };
    const value: PackageValue = { type: "NUMBER", value: quantity.value };
    const issue = findPackageValueProblem(definition, value);
    return issue
      ? { ok: false, code: "VALIDATION_FAILED", fieldErrors: { [issue.field]: issue.problem } }
      : { ok: true, value };
  }
  const min = parseQuantity(parsed.data.min);
  if (!min.ok) return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { min: min.problem } };
  const max = parseQuantity(parsed.data.max);
  if (!max.ok) return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { max: max.problem } };
  const value: PackageValue = { type: "RANGE", min: min.value, max: max.value };
  const issue = findPackageValueProblem(definition, value);
  return issue
    ? { ok: false, code: "VALIDATION_FAILED", fieldErrors: { [issue.field]: issue.problem } }
    : { ok: true, value };
}
