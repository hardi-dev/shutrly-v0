import type {
  DefinitionType,
  DefinitionTypeProblem,
  LegacySelectionType,
  PickMode,
  ValueType,
} from "./item-definition-type.types";

export const VALUE_TYPES: readonly ValueType[] = ["NUMBER", "RANGE"];
export const PICK_MODES: readonly PickMode[] = ["COUNT", "QUANTITY"];
export const UNIT_MAX_LENGTH = 20;

/** Finds the first selection rule a definition breaks (BR-CAT-002, BR-CAT-007). @param type - the definition's type settings @returns the problem or null */
export function findDefinitionTypeProblem(type: DefinitionType): DefinitionTypeProblem | null {
  if (!type.selectionRequired) {
    if (type.pickMode !== null) return "PICK_MODE_UNEXPECTED";
    return type.allowsPickNotes ? "PICK_NOTES_UNEXPECTED" : null;
  }
  if (type.valueType !== "NUMBER") return "SELECTION_NEEDS_NUMBER";
  return type.pickMode === null ? "PICK_MODE_REQUIRED" : null;
}

/** Tells whether an edit changes what BR-CAT-010 locks once a definition is used (pick notes included, D-24). @param before - stored settings @param after - requested settings @returns whether the type changes */
export function isTypeChange(before: DefinitionType, after: DefinitionType): boolean {
  return (
    before.valueType !== after.valueType ||
    before.selectionRequired !== after.selectionRequired ||
    before.pickMode !== after.pickMode ||
    before.allowsPickNotes !== after.allowsPickNotes
  );
}

/** Maps a pick mode to the legacy selection type that is dual-written until the old column is dropped (F-10 R-4). @param pickMode - the pick mode or null @returns the legacy value */
export function legacySelectionType(pickMode: PickMode | null): LegacySelectionType | null {
  if (pickMode === null) return null;
  return pickMode === "COUNT" ? "EDIT" : "PRINT";
}

/** Narrows a stored pick mode (BR-CAT-007). @param value - the stored text @returns the pick mode, or null when absent */
export function parsePickMode(value: string | null): PickMode | null {
  if (value === null) return null;
  if (value === "COUNT" || value === "QUANTITY") return value;
  throw new Error("Stored pick mode is invalid.");
}
