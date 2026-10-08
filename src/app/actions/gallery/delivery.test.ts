import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const publishFinalDeliveryEntry = vi.fn();
const completeProjectEntry = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/gallery/delivery-flow/delivery-flow", () => ({
  publishFinalDeliveryEntry,
  completeProjectEntry,
}));

const { completeProjectAction, publishFinalDeliveryAction } = await import("./delivery");

describe("delivery actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-DEL-001 refreshes the projects after publishing", async () => {
    publishFinalDeliveryEntry.mockResolvedValue(undefined);
    await expect(publishFinalDeliveryAction("ws", "p")).resolves.toBeUndefined();
    expect(publishFinalDeliveryEntry).toHaveBeenCalledWith("ws", "p");
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-DEL-002 returns the reasons without refreshing", async () => {
    const refusal = { ok: false, code: "REFUSED", reasons: ["NO_FINISHED_FILE"] };
    publishFinalDeliveryEntry.mockResolvedValue(refusal);
    await expect(publishFinalDeliveryAction("ws", "p")).resolves.toEqual(refusal);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("AC-DEL-007 refreshes after Tandai selesai", async () => {
    completeProjectEntry.mockResolvedValue(undefined);
    await expect(completeProjectAction("ws", "p")).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalled();
  });
});
