import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickedPhotoRecord,
  SelectionGroupRecord,
  SelectionRepositoryPort,
} from "../../ports/selection-repository/selection-repository.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { getPickView } from "./get-pick-view";

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

function group(id: string, patch: Partial<SelectionGroupRecord>): SelectionGroupRecord {
  return {
    id,
    projectItemId: `item-${id}`,
    name: "Foto edit",
    unit: "foto",
    mode: "COUNT",
    allowsPickNotes: true,
    baseLimit: 3,
    extraLimit: 2,
    status: "OPEN",
    usage: 1,
    pickCount: 1,
    noteCount: 1,
    submittedAt: null,
    lockedAt: null,
    sortOrder: 0,
    ...patch,
  };
}

function picked(groupId: string, photoId: string, patch: Partial<PickedPhotoRecord> = {}) {
  const record: PickedPhotoRecord = {
    groupId,
    photoId,
    quantity: 1,
    note: null,
    fileName: `${photoId}.jpg`,
    folderPath: "",
    externalFileId: `ext-${photoId}`,
    provider: "GOOGLE_DRIVE",
    missing: false,
    changedAt: new Date("2026-10-05T06:52:00Z"),
    ...patch,
  };
  return record;
}

function deps(groups: readonly SelectionGroupRecord[], picks: readonly PickedPhotoRecord[]) {
  const selections = {
    listGroups: vi.fn(() => Promise.resolve(groups)),
    listPickedPhotos: vi.fn(() => Promise.resolve(picks)),
  } as unknown as SelectionRepositoryPort;
  return { selections, directImages: false };
}

const GROUPS = [
  group(EDIT, {}),
  group(PRINT, { name: "Foto cetak", mode: "QUANTITY", allowsPickNotes: false }),
];

describe("getPickView (A-25, A-27)", () => {
  it("AC-SEL-002 returns the group with its effective limit and its own picks", async () => {
    const d = deps(GROUPS, [picked(EDIT, "p1", { note: "rapikan" })]);
    const result = await getPickView(d, CLIENT, EDIT);
    if (result.kind !== "VIEW") throw new Error("expected a view");
    expect(result.view.group).toMatchObject({
      id: EDIT,
      limit: 5,
      usage: 1,
      allowsPickNotes: true,
    });
    const [pick] = result.view.picks;
    expect([pick.photo.id, pick.quantity, pick.note]).toEqual(["p1", 1, "rapikan"]);
    expect(result.view.picks).toHaveLength(1);
  });

  it("AC-SEL-017 marks photos picked in another group with that group's name and quantity", async () => {
    const d = deps(GROUPS, [picked(PRINT, "p2", { quantity: 2 })]);
    const result = await getPickView(d, CLIENT, EDIT);
    if (result.kind !== "VIEW") throw new Error("expected a view");
    expect(result.view.picks).toEqual([]);
    expect(result.view.otherPicks).toEqual([
      { photoId: "p2", groupName: "Foto cetak", mode: "QUANTITY", quantity: 2 },
    ]);
  });

  it("AC-SEL-015 keeps a picked photo that went missing in the group's picks (A-8)", async () => {
    const d = deps(GROUPS, [picked(EDIT, "p1", { missing: true })]);
    const result = await getPickView(d, CLIENT, EDIT);
    if (result.kind !== "VIEW") throw new Error("expected a view");
    expect(result.view.picks[0]?.photo.missing).toBe(true);
  });

  it("AC-SEL-017 answers NOT_OPEN for a submitted group, so the page shows its picks read-only", async () => {
    const d = deps([group(EDIT, { status: "SUBMITTED" })], []);
    expect(await getPickView(d, CLIENT, EDIT)).toEqual({ kind: "NOT_OPEN" });
  });

  it("AC-ACC-006 answers NOT_FOUND for another project's group or a malformed id", async () => {
    const d = deps(GROUPS, []);
    expect(await getPickView(d, CLIENT, "00000000-0000-4000-8000-000000000099")).toEqual({
      kind: "NOT_FOUND",
    });
    expect(await getPickView(d, CLIENT, "not-a-uuid")).toEqual({ kind: "NOT_FOUND" });
  });
});
