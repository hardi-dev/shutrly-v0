import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const addWorkspaceClient = vi.fn();
const updateWorkspaceClient = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/booking/client-flow/client-flow", () => ({
  addWorkspaceClient,
  updateWorkspaceClient,
}));

const { addClientAction, updateClientAction } = await import("./clients");

describe("client actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-CLI-018 revalidates the clients layout only after a successful add", async () => {
    addWorkspaceClient.mockResolvedValue({ ok: true });
    await expect(addClientAction("ws-1", {})).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/clients", "layout");
  });

  it("returns a validation failure without revalidating", async () => {
    const failure = { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "EMPTY" } };
    addWorkspaceClient.mockResolvedValue(failure);
    await expect(addClientAction("ws-1", {})).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("AC-CLI-012 revalidates only after a successful update", async () => {
    updateWorkspaceClient.mockResolvedValue({ ok: true });
    await expect(updateClientAction("ws-1", "client-1", {})).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/clients", "layout");
  });
});
