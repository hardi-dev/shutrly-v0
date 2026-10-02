import { describe, expect, it } from "vitest";

import { catalogNameSchema } from "./catalog-name/catalog-name.schema";
import { itemDefinitionSchema } from "./item-definition/item-definition.schema";

describe("catalog schemas", () => {
  it.each([
    [
      { valueType: "RANGE", selectionRequired: true, selectionType: "EDIT" },
      "valueType",
      "SELECTION_NEEDS_NUMBER",
    ],
    [
      { valueType: "NUMBER", selectionRequired: true, selectionType: null },
      "selectionType",
      "SELECTION_TYPE_REQUIRED",
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
