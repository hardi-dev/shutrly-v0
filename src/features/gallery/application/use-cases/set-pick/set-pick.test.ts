import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickablePhoto,
  PickWriter,
  SelectionGroupRecord,
  StoredPick,
} from "../../ports/selection-repository/selection-repository.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { setPick } from "./set-pick";
import type { SelectionWriteDeps } from "./set-pick.types";

const GROUP_ID = "00000000-0000-4000-8000-000000000010";
const PHOTO_ID = "00000000-0000-4000-8000-000000000020";
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
  usage: 0,
  pickCount: 0,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
};
const PROOF: PickablePhoto = { kind: "PROOF", missing: false, sourceRemoved: false };

interface Setup {
  readonly group?: Partial<SelectionGroupRecord> | null;
  readonly photo?: PickablePhoto | null;
  readonly pick?: StoredPick | null;
  readonly allowed?: boolean;
}

function writer(setup: Setup): PickWriter {
  return {
    findPhoto: vi.fn(() => Promise.resolve(setup.photo === undefined ? PROOF : setup.photo)),
    findPick: vi.fn(() => Promise.resolve(setup.pick ?? null)),
    insertPick: vi.fn(() => Promise.resolve()),
    updateQuantity: vi.fn(() => Promise.resolve()),
    deletePick: vi.fn(() => Promise.resolve()),
    setNote: vi.fn(() => Promise.resolve()),
    markSubmitted: vi.fn(() => Promise.resolve()),
  };
}

function deps(setup: Setup = {}) {
  const pickWriter = writer(setup);
  const group = setup.group === null ? null : { ...GROUP, ...setup.group };
  const hit = vi.fn(() => Promise.resolve(setup.allowed ?? true));
  const withLockedGroup = vi.fn(
    (
      _context: unknown,
      _projectId: string,
      _groupId: string,
      work: (g: SelectionGroupRecord, w: PickWriter) => Promise<unknown>,
    ) => (group ? work(group, pickWriter) : Promise.resolve("NOT_FOUND" as const)),
  );
  const d = {
    selections: { withLockedGroup },
    rateLimiter: { hit, peek: vi.fn() },
  } as unknown as SelectionWriteDeps;
  return { d, pickWriter, hit, withLockedGroup };
}

const input = (quantity = 1) => ({ groupId: GROUP_ID, photoId: PHOTO_ID, quantity });

describe("setPick (D-12)", () => {
  it("AC-SEL-002 inserts a new pick and returns the new usage", async () => {
    const { d, pickWriter } = deps({ group: { usage: 1 } });
    expect(await setPick(d, CLIENT, input())).toEqual({ ok: true, usage: 2, quantity: 1 });
    expect(pickWriter.insertPick).toHaveBeenCalledWith(PHOTO_ID, 1);
  });

  it("AC-SEL-002 un-picks with quantity 0, which deletes the pick and its note (A-32)", async () => {
    const { d, pickWriter } = deps({ group: { usage: 2 }, pick: { quantity: 1, note: "x" } });
    expect(await setPick(d, CLIENT, input(0))).toEqual({ ok: true, usage: 1, quantity: 0 });
    expect(pickWriter.deletePick).toHaveBeenCalledWith(PHOTO_ID);
  });

  it("AC-SEL-003 refuses a pick past the limit and writes nothing", async () => {
    const { d, pickWriter } = deps({ group: { usage: 3 } });
    expect(await setPick(d, CLIENT, input())).toEqual({ ok: false, code: "LIMIT_REACHED" });
    expect(pickWriter.insertPick).not.toHaveBeenCalled();
  });

  it("AC-SEL-005 updates a print quantity and counts the difference", async () => {
    const { d, pickWriter } = deps({
      group: { mode: "QUANTITY", baseLimit: 2, usage: 2 },
      pick: { quantity: 2, note: null },
    });
    expect(await setPick(d, CLIENT, input(1))).toEqual({ ok: true, usage: 1, quantity: 1 });
    expect(pickWriter.updateQuantity).toHaveBeenCalledWith(PHOTO_ID, 1);
  });

  it("BR-SEL-003 refuses a quantity above 1 in a COUNT group", async () => {
    const { d } = deps();
    expect(await setPick(d, CLIENT, input(2))).toEqual({ ok: false, code: "INVALID" });
  });

  it("BR-SEL-005 refuses any change once the group is not OPEN", async () => {
    const { d, pickWriter } = deps({ group: { status: "SUBMITTED" } });
    expect(await setPick(d, CLIENT, input())).toEqual({ ok: false, code: "GROUP_NOT_OPEN" });
    expect(pickWriter.findPick).not.toHaveBeenCalled();
  });

  it.each<[string, PickablePhoto | null]>([
    ["an edited file", { kind: "EDITED", missing: false, sourceRemoved: false }],
    ["a missing photo", { ...PROOF, missing: true }],
    ["a photo of a removed source", { ...PROOF, sourceRemoved: true }],
    ["a photo outside the gallery", null],
  ])("AC-SEL-006 refuses %s", async (_label, photo) => {
    const { d, pickWriter } = deps({ photo });
    expect(await setPick(d, CLIENT, input())).toEqual({ ok: false, code: "PHOTO_NOT_SELECTABLE" });
    expect(pickWriter.insertPick).not.toHaveBeenCalled();
  });

  it("AC-SEL-015 un-picks a picked photo that went missing (A-8)", async () => {
    const { d, pickWriter } = deps({
      group: { usage: 1 },
      photo: { ...PROOF, missing: true },
      pick: { quantity: 1, note: null },
    });
    expect(await setPick(d, CLIENT, input(0))).toEqual({ ok: true, usage: 0, quantity: 0 });
    expect(pickWriter.findPhoto).not.toHaveBeenCalled();
  });

  it("AC-ACC-006 answers NOT_FOUND for a group outside the client's project", async () => {
    const { d, withLockedGroup } = deps({ group: null });
    expect(await setPick(d, CLIENT, input())).toEqual({ ok: false, code: "NOT_FOUND" });
    expect(withLockedGroup).toHaveBeenCalledWith(
      { workspaceId: CLIENT.workspaceId },
      CLIENT.projectId,
      GROUP_ID,
      expect.any(Function),
    );
  });

  it("D-6 refuses with RATE_LIMITED before taking the lock", async () => {
    const { d, withLockedGroup } = deps({ allowed: false });
    expect(await setPick(d, CLIENT, input())).toEqual({ ok: false, code: "RATE_LIMITED" });
    expect(withLockedGroup).not.toHaveBeenCalled();
  });

  it("C-004 refuses malformed input without counting or locking", async () => {
    const { d, hit } = deps();
    expect(await setPick(d, CLIENT, { groupId: "x", photoId: PHOTO_ID, quantity: -1 })).toEqual({
      ok: false,
      code: "INVALID",
    });
    expect(hit).not.toHaveBeenCalled();
  });
});
