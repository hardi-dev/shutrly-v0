import type { AppLocale } from "@/shared/locale/locale.types";

import type { DefaultItemDefinition, DefaultItemKey } from "./default-item-definitions.types";

// Seeded per workspace and backfilled by migration 0007; pick modes and notes by 0015 (BR-CAT-011).
export const DEFAULT_ITEM_DEFINITIONS: readonly DefaultItemDefinition[] = [
  {
    name: "Foto edit",
    defaultKey: "EDITED_PHOTOS",
    valueType: "NUMBER",
    unit: "foto",
    selectionRequired: true,
    pickMode: "COUNT",
    allowsPickNotes: true,
  },
  {
    name: "Foto cetak",
    defaultKey: "PRINTED_PHOTOS",
    valueType: "NUMBER",
    unit: "lembar",
    selectionRequired: true,
    pickMode: "QUANTITY",
    allowsPickNotes: false,
  },
  {
    name: "Jumlah orang",
    defaultKey: "PEOPLE_COUNT",
    valueType: "RANGE",
    unit: "orang",
    selectionRequired: false,
    pickMode: null,
    allowsPickNotes: false,
  },
  {
    name: "Durasi pemotretan",
    defaultKey: "SHOOT_DURATION",
    valueType: "NUMBER",
    unit: "jam",
    selectionRequired: false,
    pickMode: null,
    allowsPickNotes: false,
  },
];

/** D-18: the name and unit a platform-default item is seeded with, per the owner's locale (deck §5.7). */
export const DEFAULT_ITEM_COPY: Readonly<
  Record<AppLocale, Readonly<Record<DefaultItemKey, { name: string; unit: string }>>>
> = {
  en: {
    EDITED_PHOTOS: { name: "Edited photos", unit: "photos" },
    PRINTED_PHOTOS: { name: "Printed photos", unit: "prints" },
    PEOPLE_COUNT: { name: "Number of people", unit: "people" },
    SHOOT_DURATION: { name: "Shoot duration", unit: "hours" },
  },
  id: {
    EDITED_PHOTOS: { name: "Foto edit", unit: "foto" },
    PRINTED_PHOTOS: { name: "Foto cetak", unit: "lembar" },
    PEOPLE_COUNT: { name: "Jumlah orang", unit: "orang" },
    SHOOT_DURATION: { name: "Durasi pemotretan", unit: "jam" },
  },
};
