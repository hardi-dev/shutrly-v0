import { describe, expect, it } from "vitest";

import { findDefinitionTypeProblem, isTypeChange } from "./item-definition-type";

describe("item definition types (BR-CAT-001, BR-CAT-002, BR-CAT-007, BR-CAT-010)", () => {
  it.each([
    [{ valueType: "NUMBER", selectionRequired: false, selectionType: null }, null],
    [{ valueType: "RANGE", selectionRequired: false, selectionType: null }, null],
    [{ valueType: "NUMBER", selectionRequired: true, selectionType: "EDIT" }, null],
    [
      { valueType: "RANGE", selectionRequired: true, selectionType: "EDIT" },
      "SELECTION_NEEDS_NUMBER",
    ],
    [
      { valueType: "NUMBER", selectionRequired: true, selectionType: null },
      "SELECTION_TYPE_REQUIRED",
    ],
    [
      { valueType: "NUMBER", selectionRequired: false, selectionType: "PRINT" },
      "SELECTION_TYPE_UNEXPECTED",
    ],
  ] as const)("AC-CAT-007 %j → %s", (input, problem) => {
    expect(findDefinitionTypeProblem(input)).toBe(problem);
  });

  it("AC-CAT-008 renaming or changing the unit is not a type change", () => {
    const before = { valueType: "NUMBER", selectionRequired: true, selectionType: "EDIT" } as const;
    expect(isTypeChange(before, before)).toBe(false);
    expect(isTypeChange(before, { ...before, selectionType: "PRINT" })).toBe(true);
  });
});
