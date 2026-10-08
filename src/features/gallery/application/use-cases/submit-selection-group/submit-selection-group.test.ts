import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickWriter,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { SelectionWriteDeps } from "../set-pick/set-pick.types";
import { submitSelectionGroup } from "./submit-selection-group";

const GROUP_ID = "00000000-0000-4000-8000-000000000010";
const NOW = new Date("2026-10-06T12:00:00Z");
const CLIENT: ClientContext = {
  workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa"),
  projectId: "00000000-0000-4000-8000-000000000001",
  galleryId: "00000000-0000-4000-8000-000000000002",
  sessionId: "0123456789abcdef0123456789abcdef",
  token: "A".repeat(43),
  contentVersion: 1,
  finalDeliveryPublished: false,
};
const GROUP: SelectionGroupRecord = {
  id: GROUP_ID,
  projectItemId: "item",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT",
  allowsPickNotes: true,
  baseLimit: 3,
  extraLimit: 0,
  status: "OPEN",
  usage: 2,
  pickCount: 2,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
};

function setup(patch: Partial<SelectionGroupRecord> = {}, isAllowed = true) {
  const markSubmitted = vi.fn(() => Promise.resolve());
  const writer = { markSubmitted } as unknown as PickWriter;
  const hit = vi.fn(() => Promise.resolve(isAllowed));
  const withLockedGroup = vi.fn(
    (
      _context: unknown,
      _projectId: string,
      _groupId: string,
      work: (g: SelectionGroupRecord, w: PickWriter) => Promise<unknown>,
    ) => work({ ...GROUP, ...patch }, writer),
  );
  const deps = {
    selections: { withLockedGroup },
    rateLimiter: { hit, peek: vi.fn() },
  } as unknown as SelectionWriteDeps;
  return { deps, markSubmitted, withLockedGroup };
}

const run = (deps: SelectionWriteDeps, confirmBelowLimit: boolean) =>
  submitSelectionGroup(deps, CLIENT, { groupId: GROUP_ID, confirmBelowLimit }, NOW);

describe("submitSelectionGroup (D-13, A-5)", () => {
  it("AC-SEL-008 asks to confirm when places remain and writes nothing", async () => {
    const { deps, markSubmitted } = setup();
    expect(await run(deps, false)).toEqual({ ok: false, code: "NEEDS_CONFIRMATION", remaining: 1 });
    expect(markSubmitted).not.toHaveBeenCalled();
  });

  it("AC-SEL-008 sends below the limit once confirmed and keeps the group open, the effective limit counting add-on places", async () => {
    const { deps, markSubmitted } = setup({ extraLimit: 2 });
    expect(await run(deps, false)).toMatchObject({ code: "NEEDS_CONFIRMATION", remaining: 3 });
    expect(await run(deps, true)).toEqual({
      ok: true,
      groupName: "Foto edit",
      usage: 2,
      remaining: 3,
    });
    expect(markSubmitted).toHaveBeenCalledWith(NOW, false);
  });

  it("AC-SEL-008 sends again from an open group that was sent before", async () => {
    const { deps, markSubmitted } = setup({ submittedAt: new Date("2026-10-05T12:00:00Z") });
    expect(await run(deps, true)).toMatchObject({ ok: true, remaining: 1 });
    expect(markSubmitted).toHaveBeenCalledWith(NOW, false);
  });

  it("AC-SEL-008 submits and closes a full group without a confirmation", async () => {
    const { deps, markSubmitted } = setup({ usage: 3, pickCount: 3 });
    expect(await run(deps, false)).toMatchObject({ ok: true, remaining: 0 });
    expect(markSubmitted).toHaveBeenCalledWith(NOW, true);
  });

  it("AC-SEL-009 refuses a group with no picks", async () => {
    const { deps, markSubmitted } = setup({ usage: 0, pickCount: 0 });
    expect(await run(deps, true)).toEqual({ ok: false, code: "NO_PICKS" });
    expect(markSubmitted).not.toHaveBeenCalled();
  });

  it("BR-SEL-005 refuses a group that is not OPEN", async () => {
    const { deps, markSubmitted } = setup({ status: "SUBMITTED" });
    expect(await run(deps, true)).toEqual({ ok: false, code: "GROUP_NOT_OPEN" });
    expect(markSubmitted).not.toHaveBeenCalled();
  });

  it("D-6 refuses with RATE_LIMITED before taking the lock", async () => {
    const { deps, withLockedGroup } = setup({}, false);
    expect(await run(deps, true)).toEqual({ ok: false, code: "RATE_LIMITED" });
    expect(withLockedGroup).not.toHaveBeenCalled();
  });

  it("C-004 refuses malformed input", async () => {
    const { deps, withLockedGroup } = setup();
    const result = await submitSelectionGroup(deps, CLIENT, { groupId: "x" }, NOW);
    expect(result).toEqual({ ok: false, code: "INVALID" });
    expect(withLockedGroup).not.toHaveBeenCalled();
  });
});
