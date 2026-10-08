import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickWriter,
  SelectionGroupRecord,
  StoredPick,
} from "../../ports/selection-repository/selection-repository.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { SelectionWriteDeps } from "../set-pick/set-pick.types";
import { setPickNote } from "./set-pick-note";

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
  usage: 1,
  pickCount: 1,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
};

const PICK: StoredPick = { quantity: 1, note: null };

function deps(group: Partial<SelectionGroupRecord> = {}, pick: StoredPick | null = PICK) {
  const writer = {
    findPick: vi.fn(() => Promise.resolve(pick)),
    setNote: vi.fn(() => Promise.resolve()),
  } as unknown as PickWriter;
  const hit = vi.fn(() => Promise.resolve(true));
  const withLockedGroup = vi.fn(
    (
      _context: unknown,
      _projectId: string,
      _groupId: string,
      work: (g: SelectionGroupRecord, w: PickWriter) => Promise<unknown>,
    ) => work({ ...GROUP, ...group }, writer),
  );
  const d = {
    selections: { withLockedGroup },
    rateLimiter: { hit, peek: vi.fn() },
  } as unknown as SelectionWriteDeps;
  return { d, writer, hit };
}

const input = (note: string) => ({ groupId: GROUP_ID, photoId: PHOTO_ID, note });

describe("setPickNote (D-12, A-32)", () => {
  it("AC-SEL-021 stores the trimmed note", async () => {
    const { d, writer } = deps();
    expect(await setPickNote(d, CLIENT, input("  cerahkan sedikit "))).toEqual({
      ok: true,
      note: "cerahkan sedikit",
    });
    expect(writer.setNote).toHaveBeenCalledWith(PHOTO_ID, "cerahkan sedikit");
  });

  it("AC-SEL-021 clears the note when it is empty", async () => {
    const { d, writer } = deps({}, { quantity: 1, note: "lama" });
    expect(await setPickNote(d, CLIENT, input("   "))).toEqual({ ok: true, note: null });
    expect(writer.setNote).toHaveBeenCalledWith(PHOTO_ID, null);
  });

  it("AC-SEL-021 refuses 501 characters before counting or locking", async () => {
    const { d, hit } = deps();
    expect(await setPickNote(d, CLIENT, input("a".repeat(501)))).toEqual({
      ok: false,
      code: "TOO_LONG",
    });
    expect(hit).not.toHaveBeenCalled();
  });

  it("BR-SEL-005 refuses a note once the group is not OPEN", async () => {
    const { d, writer } = deps({ status: "SUBMITTED" });
    expect(await setPickNote(d, CLIENT, input("x"))).toEqual({
      ok: false,
      code: "GROUP_NOT_OPEN",
    });
    expect(writer.setNote).not.toHaveBeenCalled();
  });

  it("BR-CAT-007 refuses a note when the group's item has notes off", async () => {
    const { d } = deps({ allowsPickNotes: false });
    expect(await setPickNote(d, CLIENT, input("x"))).toEqual({ ok: false, code: "NOTES_OFF" });
  });

  it("BR-SEL-004 refuses a note on a photo that is not picked", async () => {
    const { d } = deps({}, null);
    expect(await setPickNote(d, CLIENT, input("x"))).toEqual({ ok: false, code: "NOT_PICKED" });
  });

  it("C-004 refuses a raw note longer than 2000 characters as invalid", async () => {
    const { d } = deps();
    expect(await setPickNote(d, CLIENT, input("a".repeat(2001)))).toEqual({
      ok: false,
      code: "INVALID",
    });
  });
});
