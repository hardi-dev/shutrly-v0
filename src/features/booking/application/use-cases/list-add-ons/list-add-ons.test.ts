import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { AddOnGroupFacts } from "../../ports/add-on-target/add-on-target.port";
import { listAddOns } from "./list-add-ons";
import type { ListAddOnsDeps } from "./list-add-ons.types";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const EDIT: AddOnGroupFacts = {
  id: "g1",
  name: "Foto edit",
  unit: "foto",
  status: "OPEN",
  limit: 3,
  usage: 1,
  isTargetable: true,
};
const PRINT: AddOnGroupFacts = {
  ...EDIT,
  id: "g2",
  name: "Foto cetak",
  status: "LOCKED",
  isTargetable: false,
};

function deps(status: string | null) {
  return {
    addOns: {
      findProjectStatus: vi.fn(() => Promise.resolve(status)),
      list: vi.fn(() =>
        Promise.resolve([
          { id: "a1", selectionGroupId: "g1", status: "DRAFT" },
          { id: "a2", selectionGroupId: null, status: "APPROVED" },
        ]),
      ),
    },
    targets: { listGroups: vi.fn(() => Promise.resolve([EDIT, PRINT])) },
  } as unknown as ListAddOnsDeps;
}

describe("listAddOns (addon-kartu)", () => {
  it("AC-ADD-001 joins each add-on to its group and lists only targetable groups", async () => {
    const card = await listAddOns(deps("POST_PROCESSING"), CONTEXT, "p");
    expect(card.canCreate).toBe(true);
    expect(card.addOns.map((addOn) => addOn.group?.name ?? null)).toEqual(["Foto edit", null]);
    expect(card.targets.map((group) => group.id)).toEqual(["g1"]);
    expect(card.lockedGroupNames).toEqual(["Foto cetak"]);
  });

  it("A-11 a completed project takes no new add-on", async () => {
    expect((await listAddOns(deps("COMPLETED"), CONTEXT, "p")).canCreate).toBe(false);
  });
});
