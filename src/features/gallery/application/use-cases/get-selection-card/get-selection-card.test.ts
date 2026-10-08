import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { SelectionGroupRecord } from "../../ports/selection-repository/selection-repository.port";
import type { SelectionOwnerDeps } from "../owner-selection-views/owner-selection-views.types";
import { getSelectionCard } from "./get-selection-card";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const group = (status: SelectionGroupRecord["status"]): SelectionGroupRecord => ({
  id: status,
  projectItemId: status,
  name: `Grup ${status}`,
  unit: "foto",
  mode: "COUNT",
  allowsPickNotes: true,
  baseLimit: 3,
  extraLimit: 0,
  status,
  usage: 1,
  pickCount: 1,
  noteCount: 0,
  submittedAt: null,
  lockedAt: null,
  sortOrder: 0,
});

function deps(itemCount: number, groups: SelectionGroupRecord[], galleryExists = true) {
  return {
    selections: { listGroups: vi.fn(() => Promise.resolve(groups)) },
    owner: {
      findFacts: vi.fn(() =>
        Promise.resolve({
          projectTitle: "Wisuda Rina",
          galleryExists,
          selectionItemCount: itemCount,
        }),
      ),
    },
  } as unknown as SelectionOwnerDeps;
}

describe("getSelectionCard (card export states A–E)", () => {
  it("AC-SEL-010 is NO_ITEMS for a package without selection items", async () => {
    expect((await getSelectionCard(deps(0, []), CONTEXT, "p")).state).toBe("NO_ITEMS");
  });

  it("is NOT_PUBLISHED while the groups don't exist yet", async () => {
    const card = await getSelectionCard(deps(2, [], false), CONTEXT, "p");
    expect(card).toMatchObject({ state: "NOT_PUBLISHED", galleryExists: false });
  });

  it("AC-SEL-010 asks for review when a group is submitted, and is FINAL once all are locked", async () => {
    expect(
      (await getSelectionCard(deps(2, [group("SUBMITTED"), group("OPEN")]), CONTEXT, "p")).state,
    ).toBe("REVIEW");
    expect((await getSelectionCard(deps(1, [group("LOCKED")]), CONTEXT, "p")).state).toBe("FINAL");
  });
});
