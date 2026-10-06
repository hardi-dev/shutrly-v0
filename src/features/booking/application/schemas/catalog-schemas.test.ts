import { describe, expect, it } from "vitest";

import { catalogNameSchema } from "./catalog-name/catalog-name.schema";
import { itemDefinitionSchema } from "./item-definition/item-definition.schema";

describe("catalog schemas", () => {
  it.each([
    [
      { valueType: "RANGE", selectionRequired: true, pickMode: "COUNT", allowsPickNotes: true },
      "valueType",
      "SELECTION_NEEDS_NUMBER",
    ],
    [
      { valueType: "NUMBER", selectionRequired: true, pickMode: null, allowsPickNotes: false },
      "pickMode",
      "PICK_MODE_REQUIRED",
    ],
    [
      { valueType: "NUMBER", selectionRequired: false, pickMode: null, allowsPickNotes: true },
      "allowsPickNotes",
      "PICK_NOTES_UNEXPECTED",
    ],
  ])("AC-CAT-007 rejects invalid definition settings", (input, path, message) => {
    const result = itemDefinitionSchema.safeParse({ name: "Album", unit: "buah", ...input });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.find((issue) => issue.path[0] === path)?.message).toBe(message);
    }
  });

  it("AC-CAT-019 rejects an empty catalog name", () => {
    const result = catalogNameSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.issues[0]?.message).toBe("EMPTY");
  });
});
