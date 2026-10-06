import { describe, expect, it } from "vitest";

import type { PickView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import { selectionStateOf, usageOfState, withNote, withPick } from "./pick-selection-state";

const photo = (id: string) => ({
  id,
  fileName: `${id}.jpg`,
  folderPath: "",
  thumb: { src: `/t/${id}` },
  preview: { src: `/p/${id}` },
  missing: false,
});

function view(mode: "COUNT" | "QUANTITY"): PickView {
  return {
    group: {
      id: "g",
      name: "Foto cetak",
      unit: "lembar",
      mode,
      allowsPickNotes: true,
      limit: 4,
      usage: 3,
      status: "OPEN",
    },
    picks: [
      { photo: photo("a"), quantity: 2, note: null },
      { photo: photo("b"), quantity: 1, note: "x" },
    ],
    otherPicks: [
      { photoId: "a", groupName: "Foto edit", mode: "COUNT", quantity: 1 },
      { photoId: "a", groupName: "Album", mode: "COUNT", quantity: 1 },
    ],
  };
}

describe("pick selection state (A-7, BR-SEL-003)", () => {
  it("BR-SEL-003 counts quantities in a QUANTITY group and picks in a COUNT group", () => {
    expect(usageOfState(selectionStateOf(view("QUANTITY")))).toBe(3);
    expect(usageOfState(selectionStateOf(view("COUNT")))).toBe(2);
  });

  it("A-7 adds a pick with quantity 1 and removes an un-picked one, its note with it", () => {
    const state = selectionStateOf(view("QUANTITY"));
    const picked = withPick(state, photo("c"), true);
    expect(picked.picks.get("c")).toEqual({ photo: photo("c"), quantity: 1, note: null });
    expect(usageOfState(picked)).toBe(4);
    expect(withPick(picked, photo("b"), false).picks.has("b")).toBe(false);
  });

  it("A-32 stores a note on a pick and ignores a photo that isn't picked", () => {
    const state = selectionStateOf(view("COUNT"));
    expect(withNote(state, "a", "rapikan").picks.get("a")?.note).toBe("rapikan");
    expect(withNote(state, "zz", "x")).toBe(state);
  });

  it("A-25 groups the other groups' picks by photo", () => {
    expect(selectionStateOf(view("COUNT")).otherPicks.get("a")).toHaveLength(2);
  });
});
