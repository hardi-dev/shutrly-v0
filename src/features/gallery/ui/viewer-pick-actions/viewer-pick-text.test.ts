import { describe, expect, it } from "vitest";

import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import type { PhotoTarget } from "../use-pick-targets/use-pick-targets.types";
import { noteTarget, pickedInLine, targetDescription } from "./viewer-pick-text";

const EDIT: PickGroupView = {
  id: "g1",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT",
  allowsPickNotes: true,
  limit: 8,
  usage: 3,
  status: "OPEN",
};
const PRINT: PickGroupView = {
  ...EDIT,
  id: "g2",
  name: "Foto cetak",
  unit: "lembar",
  mode: "QUANTITY",
  allowsPickNotes: false,
  limit: 4,
  usage: 1,
};
const pick = (groupId: string, note: string | null = null) => ({
  groupId,
  photoId: "p",
  quantity: 1,
  note,
});

describe("viewer pick text (pratinjau exports)", () => {
  it("AC-SEL-019 describes a group by usage and the photo's pick in it", () => {
    expect(targetDescription({ group: EDIT, pick: undefined })).toBe(
      "3 dari 8 foto · ketuk untuk memilih",
    );
    expect(targetDescription({ group: PRINT, pick: pick("g2") })).toBe(
      "1 dari 4 lembar · sudah dipilih × 1",
    );
    expect(targetDescription({ group: { ...EDIT, status: "LOCKED" }, pick: undefined })).toBe(
      "3 dari 8 foto · Dikunci",
    );
  });

  it("A-30 names where the photo is picked, with quantities and notes", () => {
    const targets: PhotoTarget[] = [
      { group: EDIT, pick: pick("g1", "rapikan") },
      { group: PRINT, pick: pick("g2") },
    ];
    expect(pickedInLine(targets)).toBe("Dipilih di: Foto edit · ada catatan, Foto cetak × 1");
    expect(pickedInLine([{ group: EDIT, pick: undefined }])).toBeNull();
  });

  it("A-32 opens the note of the first open group with notes where the photo is picked", () => {
    expect(noteTarget([{ group: PRINT, pick: pick("g2") }])).toBeUndefined();
    expect(noteTarget([{ group: EDIT, pick: pick("g1") }])?.group.id).toBe("g1");
    expect(
      noteTarget([{ group: { ...EDIT, status: "SUBMITTED" }, pick: pick("g1") }]),
    ).toBeUndefined();
  });
});
