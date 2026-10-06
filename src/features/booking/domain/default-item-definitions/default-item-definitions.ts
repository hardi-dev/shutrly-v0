import type { DefaultItemDefinition } from "./default-item-definitions.types";

// Seeded per workspace and backfilled by migration 0007; pick modes and notes by 0015 (BR-CAT-011).
export const DEFAULT_ITEM_DEFINITIONS: readonly DefaultItemDefinition[] = [
  {
    name: "Foto edit",
    valueType: "NUMBER",
    unit: "foto",
    selectionRequired: true,
    pickMode: "COUNT",
    allowsPickNotes: true,
  },
  {
    name: "Foto cetak",
    valueType: "NUMBER",
    unit: "lembar",
    selectionRequired: true,
    pickMode: "QUANTITY",
    allowsPickNotes: false,
  },
  {
    name: "Jumlah orang",
    valueType: "RANGE",
    unit: "orang",
    selectionRequired: false,
    pickMode: null,
    allowsPickNotes: false,
  },
  {
    name: "Durasi pemotretan",
    valueType: "NUMBER",
    unit: "jam",
    selectionRequired: false,
    pickMode: null,
    allowsPickNotes: false,
  },
];
