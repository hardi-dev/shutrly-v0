import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";

export interface DraftItem {
  readonly definitionId: string;
  readonly name: string;
  readonly unit: string | null;
  readonly valueType: "NUMBER" | "RANGE";
  readonly selectionRequired: boolean;
  readonly selectionType: "EDIT" | "PRINT" | null;
  readonly value: PackageValue;
}

export type PackageDraftAction =
  | { readonly type: "RESET"; readonly serviceItems: readonly DraftItem[] }
  | { readonly type: "UPDATE_VALUE"; readonly definitionId: string; readonly value: PackageValue }
  | { readonly type: "REMOVE"; readonly definitionId: string }
  | { readonly type: "ADD"; readonly item: DraftItem };
