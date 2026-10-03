import type { PackageValue } from "@/features/booking/domain/package-value/package-value.types";

import type { DraftItem, PackageDraftAction } from "./package-draft.types";

/** Applies one package edit to the form's item list; the service template is never touched (BR-PRJ-001). @param items - current draft items @param action - the edit @returns the next items */
export function reducePackageDraft(
  items: readonly DraftItem[],
  action: PackageDraftAction,
): readonly DraftItem[] {
  switch (action.type) {
    case "RESET":
      return action.serviceItems;
    case "UPDATE_VALUE":
      return items.map((item) =>
        item.definitionId === action.definitionId ? { ...item, value: action.value } : item,
      );
    case "REMOVE":
      return items.filter((item) => item.definitionId !== action.definitionId);
    case "ADD":
      return [...items, action.item];
  }
}

function samePackageValue(left: PackageValue, right: PackageValue): boolean {
  if (left.type === "NUMBER" && right.type === "NUMBER") return left.value === right.value;
  if (left.type === "RANGE" && right.type === "RANGE") {
    return left.min === right.min && left.max === right.max;
  }
  return false;
}

/** Tells whether the package differs from the service's items, so a service change must be confirmed (spec › Main Flow 3). @param items - draft items @param serviceItems - the chosen service's items @returns true when anything was changed */
export function isPackageEdited(
  items: readonly DraftItem[],
  serviceItems: readonly DraftItem[],
): boolean {
  if (items.length !== serviceItems.length) return true;
  return items.some((item, index) => {
    const original = serviceItems[index];
    return (
      original.definitionId !== item.definitionId || !samePackageValue(original.value, item.value)
    );
  });
}
