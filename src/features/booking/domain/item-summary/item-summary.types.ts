import type { PackageValue } from "../package-value/package-value.types";

export interface SummaryItem {
  readonly name: string;
  readonly unit: string | null;
  readonly value: PackageValue;
}
