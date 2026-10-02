import type {
  DefinitionType,
  DefinitionTypeProblem,
  SelectionType,
  ValueType,
} from "./item-definition-type.types";

export const VALUE_TYPES: readonly ValueType[] = ["NUMBER", "RANGE"];
export const SELECTION_TYPES: readonly SelectionType[] = ["EDIT", "PRINT"];
export const UNIT_MAX_LENGTH = 20;

/** Finds the first selection rule a definition breaks (BR-CAT-002, BR-CAT-007). @param type - the definition's type settings @returns the problem or null */
export function findDefinitionTypeProblem(type: DefinitionType): DefinitionTypeProblem | null {
  if (!type.selectionRequired)
    return type.selectionType === null ? null : "SELECTION_TYPE_UNEXPECTED";
  if (type.valueType !== "NUMBER") return "SELECTION_NEEDS_NUMBER";
  return type.selectionType === null ? "SELECTION_TYPE_REQUIRED" : null;
}

/** Tells whether an edit changes what BR-CAT-010 locks once a definition is used. @param before - stored settings @param after - requested settings @returns whether the type changes */
export function isTypeChange(before: DefinitionType, after: DefinitionType): boolean {
  return (
    before.valueType !== after.valueType ||
    before.selectionRequired !== after.selectionRequired ||
    before.selectionType !== after.selectionType
  );
}
