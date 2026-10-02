export type ValueType = "NUMBER" | "RANGE";
export type SelectionType = "EDIT" | "PRINT";

export interface DefinitionType {
  readonly valueType: ValueType;
  readonly selectionRequired: boolean;
  readonly selectionType: SelectionType | null;
}

export type DefinitionTypeProblem =
  "SELECTION_NEEDS_NUMBER" | "SELECTION_TYPE_REQUIRED" | "SELECTION_TYPE_UNEXPECTED";
