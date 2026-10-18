import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const markDeliveredEntry = vi.fn();
const completeProjectEntry = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/gallery/delivery-flow/delivery-flow", () => ({
  markDeliveredEntry,
  completeProjectEntry,
}));

const { completeProjectAction, markDeliveredAction } = await import("./delivery");

describe("delivery actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-GFL-017 refreshes the projects after marking delivered", async () => {
    markDeliveredEntry.mockResolvedValue(undefined);
    await expect(markDeliveredAction("ws", "p")).resolves.toBeUndefined();
    expect(markDeliveredEntry).toHaveBeenCalledWith("ws", "p");
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-GFL-017 returns the reasons without refreshing", async () => {
    const refusal = { ok: false, code: "REFUSED", reasons: ["NO_FINISHED_FILE"] };
    markDeliveredEntry.mockResolvedValue(refusal);
    await expect(markDeliveredAction("ws", "p")).resolves.toEqual(refusal);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("AC-DEL-007 refreshes after completing the delivered project", async () => {
    completeProjectEntry.mockResolvedValue(undefined);
    await expect(completeProjectAction("ws", "p")).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalled();
  });
});
