import { describe, expect, it } from "vitest";

import { findCatalogNameProblem } from "../catalog-name/catalog-name";
import { findDefinitionTypeProblem } from "../item-definition-type/item-definition-type";
import {
  DEFAULT_ITEM_DEFINITIONS,
  displayItemDefinition,
  itemDefinitionSubmission,
  localizeItemDefinition,
  parseDefaultItemKey,
} from "./default-item-definitions";

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

  it("D-18 every default item carries a unique key matching migration 0021", () => {
    expect(DEFAULT_ITEM_DEFINITIONS.map(({ defaultKey }) => defaultKey)).toEqual([
      "EDITED_PHOTOS",
      "PRINTED_PHOTOS",
      "PEOPLE_COUNT",
      "SHOOT_DURATION",
    ]);
  });
});

describe("displayItemDefinition (D-18)", () => {
  const keyed = {
    name: "Foto edit",
    unit: "foto",
    defaultKey: "EDITED_PHOTOS",
  } as const;

  it("D-18 a keyed default shows the English label in en", () => {
    expect(displayItemDefinition(keyed, "en")).toEqual({ name: "Edited photos", unit: "photos" });
  });

  it("D-18 a keyed default shows the Indonesian label in id", () => {
    expect(displayItemDefinition(keyed, "id")).toEqual({ name: "Foto edit", unit: "foto" });
  });

  it("D-18 a renamed item shows its stored name", () => {
    const renamed = { name: "Cetak besar", unit: "lembar", defaultKey: null };
    expect(displayItemDefinition(renamed, "en")).toEqual({ name: "Cetak besar", unit: "lembar" });
    expect(displayItemDefinition(renamed, "id")).toEqual({ name: "Cetak besar", unit: "lembar" });
  });
});

describe("parseDefaultItemKey (D-18)", () => {
  it("D-18 narrows a stored key and rejects owner or unknown values", () => {
    expect(parseDefaultItemKey("PEOPLE_COUNT")).toBe("PEOPLE_COUNT");
    expect(parseDefaultItemKey(null)).toBeNull();
    expect(parseDefaultItemKey("OTHER")).toBeNull();
  });
});

describe("localizeItemDefinition (D-18)", () => {
  it("D-18 a keyed default keeps its other fields and shows the locale's name and unit", () => {
    const row = { id: "d1", name: "Foto edit", unit: "foto", defaultKey: "EDITED_PHOTOS" as const };
    expect(localizeItemDefinition(row, "en")).toEqual({
      id: "d1",
      name: "Edited photos",
      unit: "photos",
      defaultKey: "EDITED_PHOTOS",
    });
  });
});

describe("itemDefinitionSubmission (D-18)", () => {
  const keyed = { name: "Edited photos", unit: "photos", defaultKey: "EDITED_PHOTOS" } as const;
  // Stored in Indonesian (seeded in id), shown in English.
  const stored = { name: "Foto edit", unit: "foto", defaultKey: "EDITED_PHOTOS" } as const;

  it("D-18 saving an unchanged keyed label submits the stored text and no rename", () => {
    expect(
      itemDefinitionSubmission(stored, "en", { name: "Edited photos", unit: "photos" }),
    ).toEqual({
      name: "Foto edit",
      unit: "foto",
    });
    expect(
      itemDefinitionSubmission(keyed, "en", { name: "Edited photos", unit: "photos" }),
    ).toEqual({
      name: "Edited photos",
      unit: "photos",
    });
  });

  it("D-18 a changed name is submitted as typed, and an unchanged unit keeps the stored unit", () => {
    expect(itemDefinitionSubmission(stored, "en", { name: "Cetak", unit: "photos" })).toEqual({
      name: "Cetak",
      unit: "foto",
    });
    expect(itemDefinitionSubmission(stored, "en", { name: "Cetak", unit: "prints" })).toEqual({
      name: "Cetak",
      unit: "prints",
    });
  });
});
