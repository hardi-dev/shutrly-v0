export type ValueType = "NUMBER" | "RANGE";
export type PickMode = "COUNT" | "QUANTITY";
export type LegacySelectionType = "EDIT" | "PRINT";

export interface DefinitionType {
  readonly valueType: ValueType;
  readonly selectionRequired: boolean;
  readonly pickMode: PickMode | null;
  readonly allowsPickNotes: boolean;
}

export type DefinitionTypeProblem =
  | "SELECTION_NEEDS_NUMBER"
  | "PICK_MODE_REQUIRED"
  | "PICK_MODE_UNEXPECTED"
  | "PICK_NOTES_UNEXPECTED";
