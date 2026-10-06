import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type {
  PickedPhotoRecord,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import type { SelectionOwnerDeps } from "../owner-selection-views/owner-selection-views.types";
import { getSelectionGroupDetail } from "./get-selection-group-detail";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const G1 = "00000000-0000-4000-8000-000000000010";
const GROUP: SelectionGroupRecord = {
  id: G1,
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
  noteCount: 1,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
};
const pick = (
  id: string,
  groupId: string,
  patch: Partial<PickedPhotoRecord> = {},
): PickedPhotoRecord => ({
  groupId,
  photoId: id,
  quantity: 1,
  note: null,
  fileName: `${id}.jpg`,
  folderPath: "Akad",
  externalFileId: id,
  provider: "GOOGLE_DRIVE",
  missing: false,
  changedAt: new Date("2026-10-05T06:52:00Z"),
  ...patch,
});

function deps(picks: PickedPhotoRecord[]) {
  return {
    selections: {
      listGroups: vi.fn(() => Promise.resolve([GROUP])),
      listPickedPhotos: vi.fn(() => Promise.resolve(picks)),
    },
    owner: {
      findFacts: vi.fn(() =>
        Promise.resolve({
          projectTitle: "Wisuda Rina",
          galleryExists: true,
          selectionItemCount: 1,
        }),
      ),
    },
  } as unknown as SelectionOwnerDeps;
}

describe("getSelectionGroupDetail (A-34)", () => {
  it("AC-SEL-010 returns this group's picks with folder and note, and no file ids", async () => {
    const detail = await getSelectionGroupDetail(
      deps([pick("a", G1, { note: "rapikan" }), pick("b", "other")]),
      CONTEXT,
      "p",
      G1,
    );
    expect(detail.picks).toEqual([
      {
        photoId: "a",
        fileName: "a.jpg",
        folderPath: "Akad",
        quantity: 1,
        note: "rapikan",
        missing: false,
      },
    ]);
    expect(JSON.stringify(detail)).not.toContain("externalFileId");
    expect(detail.changedAt).toBe("2026-10-05T06:52:00.000Z");
  });

  it("AC-SEL-015 flags missing photos and names them", async () => {
    const detail = await getSelectionGroupDetail(
      deps([pick("a", G1, { missing: true })]),
      CONTEXT,
      "p",
      G1,
    );
    expect([detail.missingCount, detail.missingNames]).toEqual([1, ["a.jpg"]]);
  });

  it("AC-ACC-006 throws NOT_FOUND for a malformed or foreign group id", async () => {
    await expect(getSelectionGroupDetail(deps([]), CONTEXT, "p", "nope")).rejects.toBeInstanceOf(
      GalleryError,
    );
    await expect(
      getSelectionGroupDetail(deps([]), CONTEXT, "p", "00000000-0000-4000-8000-000000000099"),
    ).rejects.toBeInstanceOf(GalleryError);
  });
});
