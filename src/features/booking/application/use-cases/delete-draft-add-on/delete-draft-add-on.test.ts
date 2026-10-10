import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { AddOnRepositoryPort } from "../../ports/add-on-repository/add-on-repository.port";
import { deleteDraftAddOn } from "./delete-draft-add-on";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const INPUT = { addOnId: "00000000-0000-4000-8000-000000000020" };

function repo(status: string) {
  const deleteDraft = vi.fn(() => Promise.resolve());
  const findForUpdate = vi.fn(() => Promise.resolve({ id: INPUT.addOnId, status }));
  return { addOns: { findForUpdate, deleteDraft } as unknown as AddOnRepositoryPort, deleteDraft };
}

describe("deleteDraftAddOn (A-35)", () => {
  it("deletes a draft", async () => {
    const { addOns, deleteDraft } = repo("DRAFT");
    expect(await deleteDraftAddOn(addOns, CONTEXT, "p", INPUT)).toBeUndefined();
    expect(deleteDraft).toHaveBeenCalledWith(CONTEXT, INPUT.addOnId);
  });

  it("AC-ADD-004 never deletes an approved add-on", async () => {
    const { addOns, deleteDraft } = repo("APPROVED");
    expect(await deleteDraftAddOn(addOns, CONTEXT, "p", INPUT)).toEqual({
      ok: false,
      code: "ADD_ON_STATUS",
    });
    expect(deleteDraft).not.toHaveBeenCalled();
  });
});
