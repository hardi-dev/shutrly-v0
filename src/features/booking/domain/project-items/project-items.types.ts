import type { PackageValue, PackageValueProblem } from "../package-value/package-value.types";

export interface ProjectItemInput {
  readonly definitionId: string;
  readonly value: PackageValue;
}
export type ItemListProblem = PackageValueProblem | "DUPLICATE_DEFINITION" | "INVALID";
export interface ItemListResult {
  readonly values: readonly (PackageValue | null)[];
  readonly errors: Readonly<Record<string, ItemListProblem>>;
}
