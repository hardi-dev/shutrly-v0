import { describe, expect, it, vi } from "vitest";

import type { AddOnStatus } from "@/features/booking/domain/add-on/add-on.types";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { AddOnRecord } from "../../ports/add-on-repository/add-on-repository.port";
import { approveAddOn } from "../approve-add-on/approve-add-on";
import { cancelAddOn } from "../cancel-add-on/cancel-add-on";
import type { AddOnStatusDeps } from "./change-add-on-status.types";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const NOW = new Date("2026-10-07T09:00:00Z");
const ID = "00000000-0000-4000-8000-000000000020";
const INPUT = { addOnId: ID };

function setup(status: AddOnStatus | null, selectionGroupId: string | null = "g") {
  const record: AddOnRecord | null = status && {
    id: ID,
    selectionGroupId,
    description: "Tambahan 5 foto edit",
    quantity: 5,
    unitPrice: "20000",
    totalAmount: "100000",
    status,
    createdAt: NOW,
  };
  const setStatus = vi.fn(() => Promise.resolve());
  const findForUpdate = vi.fn(() => Promise.resolve(record));
  const deps = { addOns: { findForUpdate, setStatus }, now: NOW } as unknown as AddOnStatusDeps;
  return { deps, setStatus };
}

describe("approve and cancel add-ons (BR-ADD-003…005, BR-AUD-001)", () => {
  it("AC-ADD-001 approving a draft records actor and time and raises the group", async () => {
    const { deps, setStatus } = setup("DRAFT");
    expect(await approveAddOn(deps, CONTEXT, "owner-1", "p", INPUT)).toEqual({
      ok: true,
      effect: { groupId: "g", delta: 5 },
    });
    expect(setStatus).toHaveBeenCalledWith(CONTEXT, ID, {
      status: "APPROVED",
      actorId: "owner-1",
      at: NOW,
    });
  });

  it("AC-ADD-003 approving an add-on without a target changes no group", async () => {
    const { deps } = setup("DRAFT", null);
    expect(await approveAddOn(deps, CONTEXT, "o", "p", INPUT)).toEqual({ ok: true, effect: null });
  });

  it("AC-ADD-005 cancelling an approved add-on lowers the group", async () => {
    const { deps, setStatus } = setup("APPROVED");
    expect(await cancelAddOn(deps, CONTEXT, "owner-1", "p", INPUT)).toEqual({
      ok: true,
      effect: { groupId: "g", delta: -5 },
    });
    expect(setStatus).toHaveBeenCalledWith(CONTEXT, ID, {
      status: "CANCELLED",
      actorId: "owner-1",
      at: NOW,
    });
  });

  it("cancelling a draft changes no group", async () => {
    const { deps } = setup("DRAFT");
    expect(await cancelAddOn(deps, CONTEXT, "o", "p", INPUT)).toEqual({ ok: true, effect: null });
  });

  it("a repeated approve is a no-op", async () => {
    const { deps, setStatus } = setup("APPROVED");
    expect(await approveAddOn(deps, CONTEXT, "o", "p", INPUT)).toEqual({ ok: true, effect: null });
    expect(setStatus).not.toHaveBeenCalled();
  });

  it("a cancelled add-on can't be approved", async () => {
    const { deps } = setup("CANCELLED");
    expect(await approveAddOn(deps, CONTEXT, "o", "p", INPUT)).toEqual({
      ok: false,
      code: "ADD_ON_STATUS",
    });
  });

  it("C-101 an add-on of another project is not found", async () => {
    const { deps } = setup(null);
    await expect(approveAddOn(deps, CONTEXT, "o", "p", INPUT)).rejects.toThrow(ProjectError);
  });
});
