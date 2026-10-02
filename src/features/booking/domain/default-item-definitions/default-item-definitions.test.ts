import { describe, expect, it } from "vitest";

import { findCatalogNameProblem } from "../catalog-name/catalog-name";
import { findDefinitionTypeProblem } from "../item-definition-type/item-definition-type";
import { DEFAULT_ITEM_DEFINITIONS } from "./default-item-definitions";

describe("default item definitions (BR-CAT-011)", () => {
  it("AC-CAT-001 seeds four valid definitions in order", () => {
    expect(DEFAULT_ITEM_DEFINITIONS.map(({ name }) => name)).toEqual([
      "Foto edit",
      "Foto cetak",
      "Jumlah orang",
      "Durasi pemotretan",
    ]);
    for (const definition of DEFAULT_ITEM_DEFINITIONS) {
      expect(findCatalogNameProblem(definition.name)).toBeNull();
      expect(findDefinitionTypeProblem(definition)).toBeNull();
    }
  });
});
