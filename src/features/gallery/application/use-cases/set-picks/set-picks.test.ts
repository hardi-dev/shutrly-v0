import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickablePhoto,
  PickWriter,
  SelectionGroupRecord,
  StoredPick,
} from "../../ports/selection-repository/selection-repository.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { SelectionWriteDeps } from "../set-pick/set-pick.types";
import { setPicks } from "./set-picks";

const GROUP_ID = "00000000-0000-4000-8000-000000000010";
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
  readonly pickedIds?: readonly string[];
  readonly allowed?: boolean;
}

function writer(setup: Setup): PickWriter {
  return {
    findPhoto: vi.fn(() => Promise.resolve(setup.photo === undefined ? PROOF : setup.photo)),
    findPick: vi.fn((id: string) =>
      Promise.resolve(setup.pickedIds?.includes(id) ? { quantity: 1, note: null } : null),
    ),
    insertPick: vi.fn(() => Promise.resolve()),
    updateQuantity: vi.fn(() => Promise.resolve()),
    deletePick: vi.fn(() => Promise.resolve()),
    setNote: vi.fn(() => Promise.resolve()),
    markSubmitted: vi.fn(() => Promise.resolve()),
    markLocked: vi.fn(() => Promise.resolve()),
    setExtraLimit: vi.fn(() => Promise.resolve()),
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

const P = (n: number) => `00000000-0000-4000-8000-${String(100 + n).padStart(12, "0")}`;
const input = (count: number) => ({
  groupId: GROUP_ID,
  photoIds: Array.from({ length: count }, (_, index) => P(index)),
});

describe("setPicks (F-19)", () => {
  it("F-19 picks every new photo × 1 and skips the ones already picked", async () => {
    const { d, pickWriter } = deps({ group: { usage: 1, baseLimit: 5 }, pickedIds: [P(0)] });
    expect(await setPicks(d, CLIENT, input(3))).toEqual({ ok: true, usage: 3, added: 2 });
    expect(pickWriter.insertPick).toHaveBeenCalledTimes(2);
    expect(pickWriter.insertPick).toHaveBeenCalledWith(P(1), 1);
  });

  it("F-19 adds × 1 in a QUANTITY group", async () => {
    const { d, pickWriter } = deps({ group: { mode: "QUANTITY", baseLimit: 5 } });
    expect(await setPicks(d, CLIENT, input(2))).toEqual({ ok: true, usage: 2, added: 2 });
    expect(pickWriter.insertPick).toHaveBeenCalledWith(P(0), 1);
  });

  it("F-19 BR-SEL-006 refuses the whole selection past the limit and writes nothing", async () => {
    const { d, pickWriter } = deps({ group: { usage: 2, baseLimit: 3 } });
    expect(await setPicks(d, CLIENT, input(2))).toEqual({
      ok: false,
      code: "LIMIT_REACHED",
      remaining: 1,
    });
    expect(pickWriter.insertPick).not.toHaveBeenCalled();
  });

  it("BR-SEL-004 refuses when one photo isn't a visible proof", async () => {
    const { d, pickWriter } = deps({ photo: { ...PROOF, kind: "EDITED" } });
    expect(await setPicks(d, CLIENT, input(1))).toEqual({
      ok: false,
      code: "PHOTO_NOT_SELECTABLE",
    });
    expect(pickWriter.insertPick).not.toHaveBeenCalled();
  });

  it("BR-SEL-005 refuses a group that isn't open", async () => {
    const { d } = deps({ group: { status: "SUBMITTED" } });
    expect(await setPicks(d, CLIENT, input(1))).toEqual({ ok: false, code: "GROUP_NOT_OPEN" });
  });

  it("refuses bad input and a rate-limited session before locking", async () => {
    const limited = deps({ allowed: false });
    expect(await setPicks(limited.d, CLIENT, input(1))).toEqual({
      ok: false,
      code: "RATE_LIMITED",
    });
    expect(limited.withLockedGroup).not.toHaveBeenCalled();
    expect(await setPicks(deps().d, CLIENT, { groupId: GROUP_ID, photoIds: [] })).toEqual({
      ok: false,
      code: "INVALID",
    });
  });
});
