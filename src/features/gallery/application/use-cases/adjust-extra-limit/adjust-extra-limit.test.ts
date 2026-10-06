import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickWriter,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import { adjustExtraLimit } from "./adjust-extra-limit";
import type { AdjustExtraLimitDeps } from "./adjust-extra-limit.types";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const GROUP: SelectionGroupRecord = {
  id: "g",
  projectItemId: "i",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT",
  allowsPickNotes: true,
  baseLimit: 3,
  extraLimit: 0,
  status: "SUBMITTED",
  usage: 3,
  pickCount: 3,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
};

function setup(group: SelectionGroupRecord | null) {
  const setExtraLimit = vi.fn(() => Promise.resolve());
  const writer = { setExtraLimit } as unknown as PickWriter;
  const withLockedGroup = vi.fn(
    (
      _c: unknown,
      _p: string,
      _g: string,
      work: (g: SelectionGroupRecord, w: PickWriter) => Promise<unknown>,
    ) => (group ? work(group, writer) : Promise.resolve("NOT_FOUND" as const)),
  );
  const deps = { selections: { withLockedGroup } } as unknown as AdjustExtraLimitDeps;
  return { deps, setExtraLimit };
}

describe("adjustExtraLimit (D-16)", () => {
  it("AC-ADD-007 raises the limit and reopens a submitted group", async () => {
    const { deps, setExtraLimit } = setup(GROUP);
    expect(await adjustExtraLimit(deps, CONTEXT, "p", { groupId: "g", delta: 5 })).toEqual({
      ok: true,
    });
    expect(setExtraLimit).toHaveBeenCalledWith(5, true);
  });

  it("AC-ADD-005 refuses a cancel below usage and writes nothing", async () => {
    const { deps, setExtraLimit } = setup({ ...GROUP, extraLimit: 5, usage: 7 });
    expect(await adjustExtraLimit(deps, CONTEXT, "p", { groupId: "g", delta: -5 })).toEqual({
      ok: false,
      code: "CANCEL_BELOW_USAGE",
      usage: 7,
      limit: 3,
    });
    expect(setExtraLimit).not.toHaveBeenCalled();
  });

  it("AC-ADD-002 refuses a group of another project", async () => {
    const { deps } = setup(null);
    expect(await adjustExtraLimit(deps, CONTEXT, "p", { groupId: "g", delta: 5 })).toEqual({
      ok: false,
      code: "TARGET_OTHER_PROJECT",
    });
  });
});
