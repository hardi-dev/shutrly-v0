import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickedPhotoRecord,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import type { SelectionOwnerDeps } from "../owner-selection-views/owner-selection-views.types";
import { listSelectionGroups, PREVIEW_LIMIT } from "./list-selection-groups";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const GROUP: SelectionGroupRecord = {
  id: "g1",
  projectItemId: "i",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT",
  allowsPickNotes: true,
  baseLimit: 20,
  extraLimit: 0,
  status: "SUBMITTED",
  usage: 11,
  pickCount: 11,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
};
const pick = (n: number, missing = false): PickedPhotoRecord => ({
  groupId: "g1",
  photoId: `p${String(n)}`,
  quantity: 1,
  note: null,
  fileName: `IMG_${String(n)}.jpg`,
  folderPath: "",
  externalFileId: `x${String(n)}`,
  provider: "GOOGLE_DRIVE",
  missing,
});

describe("listSelectionGroups (owner-1 exports)", () => {
  it("AC-SEL-010 shows up to eight present photos and counts the rest as +n", async () => {
    const picks = Array.from({ length: 11 }, (_, i) => pick(i + 1));
    const deps = {
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
    const page = await listSelectionGroups(deps, CONTEXT, "p");
    expect(page.state).toBe("REVIEW");
    expect(page.groups[0].preview.photoIds).toHaveLength(PREVIEW_LIMIT);
    expect(page.groups[0].preview.more).toBe(3);
  });

  it("AC-SEL-015 leaves a missing photo out of the strip", async () => {
    const deps = {
      selections: {
        listGroups: vi.fn(() => Promise.resolve([GROUP])),
        listPickedPhotos: vi.fn(() => Promise.resolve([pick(1, true), pick(2)])),
      },
      owner: {
        findFacts: vi.fn(() =>
          Promise.resolve({ projectTitle: "x", galleryExists: true, selectionItemCount: 1 }),
        ),
      },
    } as unknown as SelectionOwnerDeps;
    const page = await listSelectionGroups(deps, CONTEXT, "p");
    expect(page.groups[0].preview).toEqual({ photoIds: ["p2"], more: 0 });
  });
});
