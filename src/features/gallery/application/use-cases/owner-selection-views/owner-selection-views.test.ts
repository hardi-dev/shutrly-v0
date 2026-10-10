import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import type { SelectionGroupRecord } from "../../ports/selection-repository/selection-repository.port";
import { loadOwnerSelection, toOwnerGroupView } from "./owner-selection-views";
import type { SelectionOwnerDeps } from "./owner-selection-views.types";

export const GROUP: SelectionGroupRecord = {
  id: "g1",
  projectItemId: "item",
  name: "Foto edit",
  unit: "foto",
  mode: "COUNT",
  allowsPickNotes: true,
  baseLimit: 8,
  extraLimit: 2,
  status: "SUBMITTED",
  usage: 8,
  pickCount: 8,
  noteCount: 3,
  submittedAt: new Date("2026-10-05T07:20:00Z"),
  lockedAt: null,
  sortOrder: 0,
};
const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };

describe("owner selection views (A-34)", () => {
  it("BR-SEL-002 shows the effective limit and serialisable instants", () => {
    expect(toOwnerGroupView(GROUP)).toMatchObject({
      limit: 10,
      usage: 8,
      noteCount: 3,
      submittedAt: "2026-10-05T07:20:00.000Z",
      lockedAt: null,
    });
  });

  it("C-101 throws NOT_FOUND when the project isn't in the workspace, without listing groups", async () => {
    const listGroups = vi.fn();
    const deps = {
      selections: { listGroups },
      owner: { findFacts: vi.fn(() => Promise.resolve(null)) },
    } as unknown as SelectionOwnerDeps;
    await expect(loadOwnerSelection(deps, CONTEXT, "p")).rejects.toBeInstanceOf(GalleryError);
    expect(listGroups).not.toHaveBeenCalled();
  });
});
