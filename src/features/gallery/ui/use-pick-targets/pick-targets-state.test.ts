import { describe, expect, it } from "vitest";

import type { PickTargets } from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets.types";

import { targetsOfPhoto, withStoredPick, withTargetNote } from "./pick-targets-state";

const TARGETS: PickTargets = {
  groups: [
    {
      id: "g1",
      name: "Foto edit",
      unit: "foto",
      mode: "COUNT",
      allowsPickNotes: true,
      limit: 3,
      usage: 1,
      status: "OPEN",
    },
    {
      id: "g2",
      name: "Foto cetak",
      unit: "lembar",
      mode: "QUANTITY",
      allowsPickNotes: false,
      limit: 2,
      usage: 0,
      status: "OPEN",
    },
  ],
  picks: [{ groupId: "g1", photoId: "p1", quantity: 1, note: null }],
};

describe("pick targets state (A-30)", () => {
  it("AC-SEL-007 lists every group with the photo's pick in it", () => {
    const targets = targetsOfPhoto(TARGETS, "p1");
    expect(targets.map((target) => [target.group.id, target.pick?.quantity])).toEqual([
      ["g1", 1],
      ["g2", undefined],
    ]);
  });

  it("AC-SEL-019 stores a pick with the server's usage, and an un-pick drops it", () => {
    const picked = withStoredPick(TARGETS, { groupId: "g2", photoId: "p1", quantity: 1, usage: 1 });
    expect(picked.groups[1]?.usage).toBe(1);
    expect(picked.picks).toHaveLength(2);
    const unpicked = withStoredPick(picked, {
      groupId: "g1",
      photoId: "p1",
      quantity: 0,
      usage: 0,
    });
    expect(unpicked.picks).toEqual([{ groupId: "g2", photoId: "p1", quantity: 1, note: null }]);
  });

  it("A-32 stores a note on one group's pick only", () => {
    const both = withStoredPick(TARGETS, { groupId: "g2", photoId: "p1", quantity: 1, usage: 1 });
    const noted = withTargetNote(both, "g1", "p1", "rapikan");
    expect(noted.picks.map((pick) => pick.note)).toEqual(["rapikan", null]);
  });
});
