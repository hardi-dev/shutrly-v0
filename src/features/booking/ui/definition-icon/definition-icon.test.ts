import { describe, expect, it } from "vitest";

import { definitionIcon } from "./definition-icon";

describe("definitionIcon", () => {
  it("AC-CAT-001 maps definition types to the catalog glyphs", () => {
    expect(
      definitionIcon({ valueType: "NUMBER", selectionRequired: true, selectionType: "EDIT" }),
    ).toBe("image");
    expect(
      definitionIcon({ valueType: "NUMBER", selectionRequired: true, selectionType: "PRINT" }),
    ).toBe("printer");
    expect(
      definitionIcon({ valueType: "RANGE", selectionRequired: false, selectionType: null }),
    ).toBe("move-horizontal");
    expect(
      definitionIcon({ valueType: "NUMBER", selectionRequired: false, selectionType: null }),
    ).toBe("hash");
  });
});
