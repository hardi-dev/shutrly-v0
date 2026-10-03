import { describe, expect, it } from "vitest";

import { isPackageEdited, reducePackageDraft } from "./package-draft";
import type { DraftItem } from "./package-draft.types";

const FOTO_EDIT: DraftItem = {
  definitionId: "d1",
  name: "Foto edit",
  unit: "foto",
  valueType: "NUMBER",
  selectionRequired: true,
  selectionType: "EDIT",
  value: { type: "NUMBER", value: "25" },
};
const ORANG: DraftItem = {
  definitionId: "d2",
  name: "Jumlah orang",
  unit: "orang",
  valueType: "RANGE",
  selectionRequired: false,
  selectionType: null,
  value: { type: "RANGE", min: "1", max: "3" },
};
const CETAK: DraftItem = {
  definitionId: "d3",
  name: "Foto cetak",
  unit: "foto",
  valueType: "NUMBER",
  selectionRequired: true,
  selectionType: "PRINT",
  value: { type: "NUMBER", value: "10" },
};

describe("package draft (AC-PRJ-030)", () => {
  it("AC-PRJ-030 resets to the service's items", () => {
    expect(
      reducePackageDraft([CETAK], { type: "RESET", serviceItems: [FOTO_EDIT, ORANG] }),
    ).toEqual([FOTO_EDIT, ORANG]);
  });

  it("AC-PRJ-030 updates one value and keeps the order", () => {
    const next = reducePackageDraft([FOTO_EDIT, ORANG], {
      type: "UPDATE_VALUE",
      definitionId: "d1",
      value: { type: "NUMBER", value: "30" },
    });
    expect(next.map((item) => item.definitionId)).toEqual(["d1", "d2"]);
    expect(next[0]?.value).toEqual({ type: "NUMBER", value: "30" });
  });

  it("AC-PRJ-030 removes an item and appends an added one last", () => {
    const removed = reducePackageDraft([FOTO_EDIT, ORANG], { type: "REMOVE", definitionId: "d2" });
    expect(removed).toEqual([FOTO_EDIT]);
    expect(reducePackageDraft(removed, { type: "ADD", item: CETAK }).at(-1)).toEqual(CETAK);
  });

  it("AC-PRJ-030 is not edited right after a reset", () => {
    expect(isPackageEdited([FOTO_EDIT, ORANG], [FOTO_EDIT, ORANG])).toBe(false);
  });

  it("AC-PRJ-030 is edited after a change, a removal or an addition", () => {
    const original = [FOTO_EDIT, ORANG];
    expect(
      isPackageEdited(
        reducePackageDraft(original, {
          type: "UPDATE_VALUE",
          definitionId: "d1",
          value: { type: "NUMBER", value: "30" },
        }),
        original,
      ),
    ).toBe(true);
    expect(isPackageEdited([FOTO_EDIT], original)).toBe(true);
    expect(isPackageEdited([...original, CETAK], original)).toBe(true);
  });

  it("AC-PRJ-030 is not edited again once a value is put back", () => {
    const original = [FOTO_EDIT];
    const changed = reducePackageDraft(original, {
      type: "UPDATE_VALUE",
      definitionId: "d1",
      value: { type: "NUMBER", value: "30" },
    });
    const back = reducePackageDraft(changed, {
      type: "UPDATE_VALUE",
      definitionId: "d1",
      value: { type: "NUMBER", value: "25" },
    });
    expect(isPackageEdited(back, original)).toBe(false);
  });
});
