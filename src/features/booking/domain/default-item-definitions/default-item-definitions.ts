import type { DefaultItemDefinition } from "./default-item-definitions.types";

// Seeded per workspace and backfilled by migration 0007 (BR-CAT-011).
export const DEFAULT_ITEM_DEFINITIONS: readonly DefaultItemDefinition[] = [
  {
    name: "Foto edit",
    valueType: "NUMBER",
    unit: "foto",
    selectionRequired: true,
    selectionType: "EDIT",
  },
  {
    name: "Foto cetak",
    valueType: "NUMBER",
    unit: "lembar",
    selectionRequired: true,
    selectionType: "PRINT",
  },
  {
    name: "Jumlah orang",
    valueType: "RANGE",
    unit: "orang",
    selectionRequired: false,
    selectionType: null,
  },
  {
    name: "Durasi pemotretan",
    valueType: "NUMBER",
    unit: "jam",
    selectionRequired: false,
    selectionType: null,
  },
];
