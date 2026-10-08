import { describe, expect, it } from "vitest";

import { definitionIcon } from "./definition-icon";

describe("definitionIcon", () => {
  it("AC-CAT-001 maps definition types to the catalog glyphs", () => {
    expect(
      definitionIcon({
        valueType: "NUMBER",
        selectionRequired: true,
        pickMode: "COUNT",
        allowsPickNotes: true,
      }),
    ).toBe("images");
    expect(
      definitionIcon({
        valueType: "NUMBER",
        selectionRequired: true,
        pickMode: "QUANTITY",
        allowsPickNotes: false,
      }),
    ).toBe("layers");
    expect(
      definitionIcon({
        valueType: "RANGE",
        selectionRequired: false,
        pickMode: null,
        allowsPickNotes: false,
      }),
    ).toBe("move-horizontal");
    expect(
      definitionIcon({
        valueType: "NUMBER",
        selectionRequired: false,
        pickMode: null,
        allowsPickNotes: false,
      }),
    ).toBe("hash");
  });
});
