import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const rotateClientLinkEntry = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/booking/client-link-flow/client-link-flow", () => ({
  rotateClientLinkEntry,
}));

const { rotateClientLinkAction } = await import("./client-link");

describe("client link action", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-ACC-009 rotates and refreshes the project page", async () => {
    rotateClientLinkEntry.mockResolvedValue({ ok: true, token: "t" });
    await expect(rotateClientLinkAction("ws", "p")).resolves.toEqual({ ok: true, token: "t" });
    expect(rotateClientLinkEntry).toHaveBeenCalledWith("ws", "p");
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });
});
