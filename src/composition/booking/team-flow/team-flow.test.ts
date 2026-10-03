import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const addTeamRole = vi.fn();
const deleteTeamRole = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/shared/logging/logger", () => ({ logger }));
vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/features/booking/application/use-cases/add-team-role/add-team-role", () => ({
  addTeamRole,
}));
vi.mock("@/features/booking/application/use-cases/delete-team-role/delete-team-role", () => ({
  deleteTeamRole,
}));
vi.mock("../../auth/owner-guard/owner-guard", () => ({
  requireOwnerOrRedirect: vi.fn().mockResolvedValue({ id: "owner" }),
}));
vi.mock("../../workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn().mockResolvedValue({ context: { workspaceId: "ws-1" } }),
}));
vi.mock("../team-scope/team-scope", () => ({
  withTeamScope: (work: (scope: unknown) => Promise<unknown>) => work({ roles: {} }),
}));

const { TeamError } = await import("@/features/booking/application/errors/team-errors/team-errors");
const { addWorkspaceTeamRole, deleteWorkspaceTeamRole } = await import("./team-flow");

describe("team-flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-TEAM-022 maps NOT_FOUND to Next notFound", async () => {
    deleteTeamRole.mockRejectedValue(new TeamError("NOT_FOUND"));
    await expect(deleteWorkspaceTeamRole("ws-1", crypto.randomUUID())).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("AC-TEAM-022 treats a malformed role ID as not found without touching the database", async () => {
    await expect(deleteWorkspaceTeamRole("ws-1", "not-a-uuid")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(deleteTeamRole).not.toHaveBeenCalled();
  });

  it("AC-TEAM-023 C-103 logs only safe identifiers on an unexpected error", async () => {
    addTeamRole.mockRejectedValue(new Error("database unavailable"));
    await expect(addWorkspaceTeamRole("ws-1", { name: "Rahasia" })).rejects.toMatchObject({
      code: "SAVE_FAILED",
    });
    expect(logger.error).toHaveBeenCalledWith("team.save_failed", {
      workspaceId: "ws-1",
      operation: "add-role",
    });
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("Rahasia");
  });
});
