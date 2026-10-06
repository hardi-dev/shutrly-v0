import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickedPhotoRecord,
  SelectionGroupRecord,
  SelectionRepositoryPort,
} from "../../ports/selection-repository/selection-repository.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { getReview } from "./get-review";

const EDIT = "00000000-0000-4000-8000-000000000010";
const PRINT = "00000000-0000-4000-8000-000000000011";
const CLIENT: ClientContext = {
  workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa"),
  projectId: "00000000-0000-4000-8000-000000000001",
  galleryId: "00000000-0000-4000-8000-000000000002",
  sessionId: "0123456789abcdef0123456789abcdef",
  token: "A".repeat(43),
  contentVersion: 1,
  finalDeliveryPublished: false,
};

function group(id: string, patch: Partial<SelectionGroupRecord> = {}): SelectionGroupRecord {
  return {
    id,
    projectItemId: `item-${id}`,
    name: "Foto edit",
    unit: "foto",
    mode: "COUNT",
    allowsPickNotes: true,
    baseLimit: 3,
    extraLimit: 1,
    status: "OPEN",
    usage: 2,
    pickCount: 2,
    noteCount: 0,
    submittedAt: null,
    lockedAt: null,
    sortOrder: 0,
    ...patch,
  };
}

const pick = (groupId: string, photoId: string, patch: Partial<PickedPhotoRecord> = {}) => ({
  groupId,
  photoId,
  quantity: 1,
  note: null,
  fileName: `${photoId}.jpg`,
  folderPath: "Akad",
  externalFileId: `ext-${photoId}`,
  provider: "GOOGLE_DRIVE" as const,
  missing: false,
  ...patch,
});

function deps(groups: SelectionGroupRecord[], picks: PickedPhotoRecord[]) {
  const selections = {
    listGroups: vi.fn(() => Promise.resolve(groups)),
    listPickedPhotos: vi.fn(() => Promise.resolve(picks)),
  } as unknown as SelectionRepositoryPort;
  return { selections, directImages: false };
}

describe("getReview (A-29)", () => {
  it("AC-SEL-008 returns this group's picks with the effective limit and the places left", async () => {
    const d = deps(
      [group(EDIT), group(PRINT)],
      [pick(EDIT, "a"), pick(EDIT, "b"), pick(PRINT, "c")],
    );
    const result = await getReview(d, CLIENT, EDIT);
    if (result.kind !== "VIEW") throw new Error("expected a view");
    expect(result.view.group).toMatchObject({ limit: 4, usage: 2 });
    expect(result.view.remaining).toBe(2);
    expect(result.view.isEditable).toBe(true);
    expect(result.view.picks.map((p) => p.photo.id)).toEqual(["a", "b"]);
  });

  it("AC-SEL-021 carries each note and a print quantity", async () => {
    const d = deps(
      [group(PRINT, { mode: "QUANTITY", allowsPickNotes: false })],
      [pick(PRINT, "c", { quantity: 2, note: "x" })],
    );
    const result = await getReview(d, CLIENT, PRINT);
    if (result.kind !== "VIEW") throw new Error("expected a view");
    expect(result.view.picks[0]).toMatchObject({ quantity: 2, note: "x" });
  });

  it("AC-SEL-008 is read-only once the group is submitted or locked", async () => {
    for (const status of ["SUBMITTED", "LOCKED"] as const) {
      const result = await getReview(
        deps([group(EDIT, { status })], [pick(EDIT, "a")]),
        CLIENT,
        EDIT,
      );
      if (result.kind !== "VIEW") throw new Error("expected a view");
      expect(result.view.isEditable).toBe(false);
      expect(result.view.picks).toHaveLength(1);
    }
  });

  it("AC-SEL-015 keeps a picked photo that went missing so it can be removed", async () => {
    const d = deps([group(EDIT)], [pick(EDIT, "a", { missing: true })]);
    const result = await getReview(d, CLIENT, EDIT);
    if (result.kind !== "VIEW") throw new Error("expected a view");
    expect(result.view.picks[0].photo.missing).toBe(true);
  });

  it("AC-ACC-006 answers NOT_FOUND for another project's group or a malformed id", async () => {
    const d = deps([group(EDIT)], []);
    expect(await getReview(d, CLIENT, "00000000-0000-4000-8000-000000000099")).toEqual({
      kind: "NOT_FOUND",
    });
    expect(await getReview(d, CLIENT, "nope")).toEqual({ kind: "NOT_FOUND" });
  });
});
