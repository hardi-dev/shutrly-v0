import { describe, expect, it } from "vitest";

import {
  maxQuantityOf,
  remainingOfReview,
  usageOfReview,
  withQuantity,
  withRestored,
  withReviewNote,
} from "./review-state";
import type { ReviewState } from "./use-review-screen.types";

const photo = (id: string) => ({
  id,
  fileName: `${id}.jpg`,
  folderPath: "",
  thumb: { src: `/t/${id}` },
  preview: { src: `/p/${id}` },
  missing: false,
});

function state(mode: "COUNT" | "QUANTITY", limit = 4): ReviewState {
  return {
    group: {
      id: "g",
      name: "Foto cetak",
      unit: "lembar",
      mode,
      allowsPickNotes: true,
      limit,
      usage: 3,
      status: "OPEN",
    },
    picks: [
      { photo: photo("a"), quantity: 2, note: null },
      { photo: photo("b"), quantity: 1, note: "x" },
    ],
  };
}

describe("review state (A-9, A-29)", () => {
  it("BR-SEL-003 counts quantities in a QUANTITY group and photos in a COUNT group", () => {
    expect(usageOfReview(state("QUANTITY"))).toBe(3);
    expect(usageOfReview(state("COUNT", 3))).toBe(2);
    expect(remainingOfReview(state("QUANTITY"))).toBe(1);
  });

  it("A-9 lets a stepper reach its quantity plus the places left", () => {
    const s = state("QUANTITY");
    expect(maxQuantityOf(s, s.picks[0])).toBe(3);
    expect(maxQuantityOf(s, s.picks[1])).toBe(2);
  });

  it("AC-SEL-018 changes a quantity, and quantity 0 removes the pick with its note", () => {
    const changed = withQuantity(state("QUANTITY"), "a", 3);
    expect(usageOfReview(changed)).toBe(4);
    const removed = withQuantity(changed, "b", 0);
    expect(removed.picks.map((pick) => pick.photo.id)).toEqual(["a"]);
  });

  it("AC-SEL-003 restores a refused change in its old place", () => {
    const s = state("QUANTITY");
    const removed = withQuantity(s, "a", 0);
    expect(withRestored(removed, s.picks[0], 0).picks.map((pick) => pick.photo.id)).toEqual([
      "a",
      "b",
    ]);
  });

  it("A-32 stores a note on one pick", () => {
    const noted = withReviewNote(state("COUNT"), "a", "rapikan");
    expect(noted.picks.map((pick) => pick.note)).toEqual(["rapikan", "x"]);
  });
});
