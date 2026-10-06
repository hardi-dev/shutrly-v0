import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const createAddOnEntry = vi.fn();
const approveAddOnEntry = vi.fn();
const cancelAddOnEntry = vi.fn();
const deleteDraftAddOnEntry = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/booking/add-on-flow/add-on-flow", () => ({
  createAddOnEntry,
  approveAddOnEntry,
  cancelAddOnEntry,
  deleteDraftAddOnEntry,
}));

const { approveAddOnAction, cancelAddOnAction, createAddOnAction } = await import("./add-ons");

describe("add-on actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-ADD-001 refreshes the project page after a draft is created", async () => {
    createAddOnEntry.mockResolvedValue({ ok: true, addOnId: "a" });
    await expect(createAddOnAction("ws", "p", { description: "x" })).resolves.toEqual({
      ok: true,
      addOnId: "a",
    });
    expect(createAddOnEntry).toHaveBeenCalledWith("ws", "p", { description: "x" });
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-ADD-001 refreshes after an approval", async () => {
    approveAddOnEntry.mockResolvedValue(undefined);
    await expect(approveAddOnAction("ws", "p", { addOnId: "a" })).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalled();
  });

  it("AC-ADD-005 returns a refused cancel without refreshing", async () => {
    const refusal = { ok: false, code: "CANCEL_BELOW_USAGE", usage: 7, limit: 3 };
    cancelAddOnEntry.mockResolvedValue(refusal);
    await expect(cancelAddOnAction("ws", "p", { addOnId: "a" })).resolves.toEqual(refusal);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
