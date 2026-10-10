import { describe, expect, it } from "vitest";

import {
  findDefinitionTypeProblem,
  isTypeChange,
  legacySelectionType,
  parsePickMode,
} from "./item-definition-type";
import type { DefinitionType } from "./item-definition-type.types";

const plain: DefinitionType = {
  valueType: "NUMBER",
  selectionRequired: false,
  pickMode: null,
  allowsPickNotes: false,
};

describe("item definition types (BR-CAT-001, BR-CAT-002, BR-CAT-007, BR-CAT-010)", () => {
  it.each([
    [plain, null],
    [{ ...plain, valueType: "RANGE" }, null],
    [{ ...plain, selectionRequired: true, pickMode: "COUNT", allowsPickNotes: true }, null],
    [{ ...plain, selectionRequired: true, pickMode: "QUANTITY" }, null],
    [
      { ...plain, valueType: "RANGE", selectionRequired: true, pickMode: "COUNT" },
      "SELECTION_NEEDS_NUMBER",
    ],
    [{ ...plain, selectionRequired: true }, "PICK_MODE_REQUIRED"],
    [{ ...plain, pickMode: "QUANTITY" }, "PICK_MODE_UNEXPECTED"],
    [{ ...plain, allowsPickNotes: true }, "PICK_NOTES_UNEXPECTED"],
  ] as const)("AC-CAT-007 AC-CAT-001 %j → %s", (input, problem) => {
    expect(findDefinitionTypeProblem(input)).toBe(problem);
  });

  it("AC-CAT-008 renaming or changing the unit is not a type change", () => {
    const before = {
      ...plain,
      selectionRequired: true,
      pickMode: "COUNT",
      allowsPickNotes: true,
    } as const;
    expect(isTypeChange(before, before)).toBe(false);
    expect(isTypeChange(before, { ...before, pickMode: "QUANTITY" })).toBe(true);
  });

  it("AC-CAT-001 BR-CAT-010 turning pick notes on or off is a type change", () => {
    const before = {
      ...plain,
      selectionRequired: true,
      pickMode: "COUNT",
      allowsPickNotes: true,
    } as const;
    expect(isTypeChange(before, { ...before, allowsPickNotes: false })).toBe(true);
  });

  it("dual-writes the legacy selection type (F-10 R-4)", () => {
    expect(legacySelectionType("COUNT")).toBe("EDIT");
    expect(legacySelectionType("QUANTITY")).toBe("PRINT");
    expect(legacySelectionType(null)).toBeNull();
  });

  it("narrows a stored pick mode and refuses an unknown one", () => {
    expect(parsePickMode("QUANTITY")).toBe("QUANTITY");
    expect(parsePickMode(null)).toBeNull();
    expect(() => parsePickMode("EDIT")).toThrow();
  });
});
