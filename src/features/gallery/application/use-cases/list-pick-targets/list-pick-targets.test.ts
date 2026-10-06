import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type {
  PickedPhotoRecord,
  SelectionGroupRecord,
  SelectionRepositoryPort,
} from "../../ports/selection-repository/selection-repository.port";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { listPickTargets } from "./list-pick-targets";

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
  id: "g-print",
  projectItemId: "item",
  name: "Foto cetak",
  unit: "lembar",
  mode: "QUANTITY",
  allowsPickNotes: false,
  baseLimit: 2,
  extraLimit: 2,
  status: "SUBMITTED",
  usage: 1,
  pickCount: 1,
  noteCount: 0,
  submittedAt: new Date(),
  lockedAt: null,
  sortOrder: 1,
};
const PICK: PickedPhotoRecord = {
  groupId: "g-print",
  photoId: "p-7",
  quantity: 1,
  note: null,
  fileName: "IMG_007.jpg",
  folderPath: "",
  externalFileId: "drive-7",
  provider: "GOOGLE_DRIVE",
  missing: false,
  changedAt: new Date("2026-10-05T06:52:00Z"),
};

describe("listPickTargets (A-30)", () => {
  it("AC-SEL-019 lists every group with its effective limit, usage and status, and the picks", async () => {
    const selections = {
      listGroups: vi.fn(() => Promise.resolve([GROUP])),
      listPickedPhotos: vi.fn(() => Promise.resolve([PICK])),
    } as unknown as SelectionRepositoryPort;
    const targets = await listPickTargets({ selections }, CLIENT);
    expect(targets.groups).toEqual([
      {
        id: "g-print",
        name: "Foto cetak",
        unit: "lembar",
        mode: "QUANTITY",
        allowsPickNotes: false,
        limit: 4,
        usage: 1,
        status: "SUBMITTED",
      },
    ]);
    // C-103: the viewer gets ids and quantities only, no file facts.
    expect(targets.picks).toEqual([
      { groupId: "g-print", photoId: "p-7", quantity: 1, note: null },
    ]);
  });
});
