import { describe, expect, it } from "vitest";

import { catalogNameKey, findCatalogNameProblem, normaliseCatalogName } from "./catalog-name";

describe("catalog names (BR-CAT-009)", () => {
  it.each([
    ["", "EMPTY"],
    ["   ", "EMPTY"],
    ["a".repeat(61), "TOO_LONG"],
    [`  ${"a".repeat(60)} `, null],
    ["Wisuda Basic", null],
  ])("AC-CAT-019 %j → %s", (raw, problem) => {
    expect(findCatalogNameProblem(raw)).toBe(problem);
  });

  it("AC-CAT-019 trims and keys names case-insensitively", () => {
    expect(normaliseCatalogName("  Wisuda Basic ")).toBe("Wisuda Basic");
    expect(catalogNameKey("WISUDA basic")).toBe(catalogNameKey(" wisuda Basic"));
  });
});
