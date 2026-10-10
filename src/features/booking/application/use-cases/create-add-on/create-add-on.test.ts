import { describe, expect, it, vi } from "vitest";

import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { AddOnTargetVerdict } from "../../ports/add-on-target/add-on-target.port";
import { createAddOn } from "./create-add-on";
import type { CreateAddOnDeps } from "./create-add-on.types";

const CONTEXT = { workspaceId: asWorkspaceId("00000000-0000-4000-8000-0000000000aa") };
const GROUP = "00000000-0000-4000-8000-000000000010";
const VALID = {
  description: " Tambahan 5 foto edit ",
  selectionGroupId: GROUP,
  quantity: "5",
  unitPrice: "20.000",
};

function setup(status: string | null = "POST_PROCESSING", verdict: AddOnTargetVerdict = "OK") {
  const insert = vi.fn(() => Promise.resolve("new-id"));
  const check = vi.fn(() => Promise.resolve(verdict));
  const deps = {
    addOns: { findProjectStatus: vi.fn(() => Promise.resolve(status)), insert },
    targets: { check },
  } as unknown as CreateAddOnDeps;
  return { deps, insert, check };
}

const run = (deps: CreateAddOnDeps, input: unknown) =>
  createAddOn(deps, CONTEXT, "owner-1", "p", input, "id-ID");

describe("createAddOn (D-16)", () => {
  it("AC-ADD-001 stores a draft with the total computed on the server", async () => {
    const { deps, insert } = setup();
    expect(await run(deps, { ...VALID, totalAmount: "1", status: "APPROVED" })).toEqual({
      ok: true,
      addOnId: "new-id",
    });
    expect(insert).toHaveBeenCalledWith(CONTEXT, {
      projectId: "p",
      selectionGroupId: GROUP,
      description: "Tambahan 5 foto edit",
      quantity: 5,
      unitPrice: "20000",
      totalAmount: "100000",
      createdBy: "owner-1",
    });
  });

  it("AC-ADD-003 an add-on without a target skips the target check", async () => {
    const { deps, check, insert } = setup();
    const input = {
      description: "Album tambahan",
      selectionGroupId: "",
      quantity: 1,
      unitPrice: "750000",
    };
    expect(await run(deps, input)).toEqual({ ok: true, addOnId: "new-id" });
    expect(check).not.toHaveBeenCalled();
    expect(insert).toHaveBeenCalledWith(
      CONTEXT,
      expect.objectContaining({ selectionGroupId: null, totalAmount: "750000" }),
    );
  });

  it.each([
    [{ quantity: "0" }, "quantity", "TOO_SMALL"],
    [{ unitPrice: "-5" }, "unitPrice", "NEGATIVE"],
    [{ unitPrice: "20000,5" }, "unitPrice", "NOT_WHOLE"],
    [{ description: "   " }, "description", "EMPTY"],
    [{ description: "x".repeat(101) }, "description", "TOO_LONG"],
    [{ quantity: "1.5" }, "quantity", "NOT_WHOLE"],
  ])("AC-ADD-006 refuses %j with a field error", async (change, field, key) => {
    const { deps, insert } = setup();
    expect(await run(deps, { ...VALID, ...change })).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { [field]: key },
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it("refuses a total above the largest stored amount", async () => {
    const { deps } = setup();
    const result = await run(deps, { ...VALID, quantity: "2", unitPrice: "999999999999" });
    expect(result).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { unitPrice: "TOO_LARGE" },
    });
  });

  it.each([
    ["TARGET_LOCKED", "TARGET_LOCKED"],
    ["TARGET_OTHER_PROJECT", "NOT_AN_OPTION"],
  ] as const)("AC-ADD-002 a %s target is a field error", async (verdict, key) => {
    const { deps, insert } = setup("POST_PROCESSING", verdict);
    expect(await run(deps, VALID)).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { selectionGroupId: key },
    });
    expect(insert).not.toHaveBeenCalled();
  });

  it.each(["DRAFT", "COMPLETED", "CANCELLED"])("A-11 a %s project takes no add-on", async (s) => {
    const { deps } = setup(s);
    expect(await run(deps, VALID)).toEqual({ ok: false, code: "PROJECT_STATUS" });
  });

  it("C-101 a project outside the workspace is not found", async () => {
    const { deps } = setup(null);
    await expect(run(deps, VALID)).rejects.toThrow(ProjectError);
  });
});
