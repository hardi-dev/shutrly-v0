import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type {
  PickWriter,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import { lockSelectionGroup } from "./lock-selection-group";
import type { LockSelectionGroupDeps } from "./lock-selection-group.types";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const NOW = new Date("2026-10-05T09:05:00Z");
const GROUP_ID = "00000000-0000-4000-8000-000000000010";
const GROUP: SelectionGroupRecord = {
  id: GROUP_ID,
  projectItemId: "i",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT",
  allowsPickNotes: true,
  baseLimit: 3,
  extraLimit: 0,
  status: "SUBMITTED",
  usage: 2,
  pickCount: 2,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
};

function setup(status: SelectionGroupRecord["status"], isFound = true) {
  const markLocked = vi.fn(() => Promise.resolve());
  const writer = { markLocked } as unknown as PickWriter;
  const withLockedGroup = vi.fn(
    (
      _c: unknown,
      _p: string,
      _g: string,
      work: (g: SelectionGroupRecord, w: PickWriter) => Promise<unknown>,
    ) => (isFound ? work({ ...GROUP, status }, writer) : Promise.resolve("NOT_FOUND" as const)),
  );
  const deps = { selections: { withLockedGroup }, now: NOW } as unknown as LockSelectionGroupDeps;
  return { deps, markLocked };
}

const run = (deps: LockSelectionGroupDeps, intent: string) =>
  lockSelectionGroup(deps, CONTEXT, "owner-1", "p", { groupId: GROUP_ID, intent });

describe("lockSelectionGroup (D-13, BR-AUD-001)", () => {
  it("AC-SEL-011 locks a submitted group with the actor and the time", async () => {
    const { deps, markLocked } = setup("SUBMITTED");
    expect(await run(deps, "LOCK")).toEqual({ ok: true, groupName: "Foto edit" });
    expect(markLocked).toHaveBeenCalledWith("owner-1", NOW);
  });

  it("AC-SEL-011 closes an open group", async () => {
    const { deps, markLocked } = setup("OPEN");
    expect(await run(deps, "CLOSE")).toMatchObject({ ok: true });
    expect(markLocked).toHaveBeenCalledTimes(1);
  });

  it("BR-SEL-005 refuses the wrong action and any action on a locked group, writing nothing", async () => {
    for (const [status, intent] of [
      ["OPEN", "LOCK"],
      ["SUBMITTED", "CLOSE"],
      ["LOCKED", "LOCK"],
      ["LOCKED", "CLOSE"],
    ] as const) {
      const { deps, markLocked } = setup(status);
      expect(await run(deps, intent)).toEqual({ ok: false, code: "INVALID_STATE" });
      expect(markLocked).not.toHaveBeenCalled();
    }
  });

  it("C-004 refuses malformed input before taking the lock", async () => {
    const { deps } = setup("SUBMITTED");
    expect(await run(deps, "DELETE")).toEqual({ ok: false, code: "INVALID" });
  });

  it("C-101 throws NOT_FOUND for a group outside the workspace's project", async () => {
    const { deps } = setup("SUBMITTED", false);
    await expect(run(deps, "LOCK")).rejects.toBeInstanceOf(GalleryError);
  });
});
