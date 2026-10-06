import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  SelectionGroupRecord,
  SelectionRepositoryPort,
} from "../../ports/selection-repository/selection-repository.port";
import { syncGroupWithItem } from "./sync-group-with-item";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-000000000001") };
const GROUP: SelectionGroupRecord = {
  id: "group",
  projectItemId: "item",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT",
  allowsPickNotes: true,
  baseLimit: 3,
  extraLimit: 1,
  status: "OPEN",
  usage: 3,
  pickCount: 3,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
};

function repository(group: SelectionGroupRecord | null, limit: number): SelectionRepositoryPort {
  return {
    listGroups: vi.fn(),
    lockProject: vi.fn(() => Promise.resolve(true)),
    findGroupByItemForUpdate: vi.fn(() => Promise.resolve(group)),
    itemLimit: vi.fn(() => Promise.resolve(limit)),
    createGroupForItem: vi.fn(() => Promise.resolve()),
    setBaseLimit: vi.fn(() => Promise.resolve()),
    deleteGroup: vi.fn(() => Promise.resolve()),
    withLockedGroup: vi.fn(),
    listPickedPhotos: vi.fn(),
  };
}

const value = { kind: "VALUE", projectId: "project", itemId: "item" } as const;

describe("syncGroupWithItem (D-10c, BR-PRJ-009)", () => {
  it("AC-SEL-013 keeps add-ons in the check: base 2 + extra 1 still covers usage 3", async () => {
    const selections = repository(GROUP, 2);
    expect(await syncGroupWithItem({ selections }, CONTEXT, value)).toEqual({ ok: true });
    expect(selections.setBaseLimit).toHaveBeenCalledWith(CONTEXT, "group", 2);
  });

  it("AC-SEL-013 refuses a value that leaves less than the usage", async () => {
    const selections = repository(GROUP, 1);
    expect(await syncGroupWithItem({ selections }, CONTEXT, value)).toEqual({
      ok: false,
      code: "SELECTION_IN_USE",
      usage: 3,
      unit: "foto",
    });
    expect(selections.setBaseLimit).not.toHaveBeenCalled();
  });

  it("AC-SEL-014 refuses any change to a submitted group", async () => {
    const selections = repository({ ...GROUP, status: "SUBMITTED" }, 5);
    expect(await syncGroupWithItem({ selections }, CONTEXT, value)).toEqual({
      ok: false,
      code: "SELECTION_CLOSED",
    });
  });

  it("D-17 locks the project before the group", async () => {
    const selections = repository(null, 0);
    await syncGroupWithItem({ selections }, CONTEXT, value);
    expect(vi.mocked(selections.lockProject).mock.invocationCallOrder[0]).toBeLessThan(
      vi.mocked(selections.findGroupByItemForUpdate).mock.invocationCallOrder[0],
    );
  });
});
