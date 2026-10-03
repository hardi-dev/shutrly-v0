import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const addClient = vi.fn();
const countClients = vi.fn();
const listClients = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/shared/logging/logger", () => ({ logger }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/features/booking/application/use-cases/add-client/add-client", () => ({ addClient }));
vi.mock("@/features/booking/application/use-cases/count-clients/count-clients", () => ({
  countClients,
}));
vi.mock("@/features/booking/application/use-cases/list-clients/list-clients", () => ({
  listClients,
}));
vi.mock("../../auth/owner-guard/owner-guard", () => ({
  requireOwnerOrRedirect: vi.fn().mockResolvedValue({ id: "owner" }),
}));
vi.mock("../../workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn().mockResolvedValue({ context: { workspaceId: "ws-1" } }),
}));
vi.mock("../client-scope/client-scope", () => ({
  withClientScope: (work: (scope: unknown) => Promise<unknown>) => work({ clients: {} }),
}));

const { ClientError } =
  await import("@/features/booking/application/errors/client-errors/client-errors");
const { addWorkspaceClient, loadClients } = await import("./client-flow");

describe("client-flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-CLI-018 maps NOT_FOUND to Next notFound", async () => {
    addClient.mockRejectedValue(new ClientError("NOT_FOUND"));
    await expect(addWorkspaceClient("ws-1", {})).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("AC-CLI-017 AC-CLI-019 logs only safe add identifiers on an unexpected error", async () => {
    addClient.mockRejectedValue(new Error("database unavailable"));
    const values = { name: "Rahasia", whatsappNumber: "0812", socialLinks: [] };
    await expect(addWorkspaceClient("ws-1", values)).rejects.toMatchObject({ code: "SAVE_FAILED" });
    expect(logger.error).toHaveBeenCalledWith("client.save_failed", {
      workspaceId: "ws-1",
      operation: "add",
    });
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("Rahasia");
  });

  it("TD-A-1 loads an invalid search as an unfiltered list", async () => {
    listClients.mockResolvedValue({ items: [], nextCursor: null });
    countClients.mockResolvedValue(0);
    const data = await loadClients("ws-1", "ACTIVE", "a".repeat(101));
    expect(data.q).toBe("");
    expect(listClients).toHaveBeenCalledWith(
      {},
      { workspaceId: "ws-1" },
      {
        status: "ACTIVE",
        q: "",
        afterId: null,
      },
    );
  });
});
