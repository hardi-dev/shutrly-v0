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

/** The stored text of an item definition and its platform key, as the rows carry them (D-18). */
export interface DisplayableItemDefinition {
  readonly name: string;
  readonly unit: string | null;
  readonly defaultKey: DefaultItemKey | null;
}

/**
 * D-18: a keyed platform default shows its label in the reader's language; a renamed or owner item shows its stored text.
 * @param definition - the stored name and unit with the platform key, when it has one
 * @param locale - the locale the screen is rendered in
 * @returns the name and unit to show
 */
export function displayItemDefinition(
  definition: DisplayableItemDefinition,
  locale: AppLocale,
): { readonly name: string; readonly unit: string | null } {
  if (definition.defaultKey === null) return { name: definition.name, unit: definition.unit };
  const copy = DEFAULT_ITEM_COPY[locale][definition.defaultKey];
  return { name: copy.name, unit: copy.unit };
}

const DEFAULT_ITEM_KEYS: readonly DefaultItemKey[] = [
  "EDITED_PHOTOS",
  "PRINTED_PHOTOS",
  "PEOPLE_COUNT",
  "SHOOT_DURATION",
];

/**
 * Narrows a stored `default_key` to a known item key (migration 0021 CHECK list).
 * @param raw - the column value
 * @returns the key, or null for an owner item or an unknown value
 */
export function parseDefaultItemKey(raw: string | null): DefaultItemKey | null {
  return DEFAULT_ITEM_KEYS.find((key) => key === raw) ?? null;
}

/**
 * D-18: a copy of the row whose name and unit are the labels the reader sees.
 * @param definition - the stored row, with its platform key
 * @param locale - the locale the screen is rendered in
 * @returns the row with `name` and `unit` replaced by the displayed text; every other field is kept
 */
export function localizeItemDefinition<T extends DisplayableItemDefinition>(
  definition: T,
  locale: AppLocale,
): T {
  return { ...definition, ...displayItemDefinition(definition, locale) };
}

/**
 * D-18: the name and unit an edit submits. A field the owner did not change submits the stored text, so saving
 * a keyed default whose label is shown in another language does not count as a rename and keeps the key.
 * @param definition - the stored row being edited
 * @param locale - the locale the dialog is rendered in
 * @param edited - the values in the form
 * @returns the name and unit to save
 */
export function itemDefinitionSubmission(
  definition: DisplayableItemDefinition,
  locale: AppLocale,
  edited: { readonly name: string; readonly unit: string },
): { readonly name: string; readonly unit: string } {
  const shown = displayItemDefinition(definition, locale);
  return {
    name: edited.name === shown.name ? definition.name : edited.name,
    unit: edited.unit === (shown.unit ?? "") ? (definition.unit ?? "") : edited.unit,
  };
}
