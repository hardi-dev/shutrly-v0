import { beforeEach, describe, expect, it, vi } from "vitest";

const logger = { error: vi.fn(), info: vi.fn(), warn: vi.fn() };
const addTeamRole = vi.fn();
const deleteTeamRole = vi.fn();
const addTeamMember = vi.fn();
const updateTeamMember = vi.fn();
const setTeamMemberArchived = vi.fn();
const deleteTeamMember = vi.fn();
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
vi.mock("@/features/booking/application/use-cases/add-team-member/add-team-member", () => ({
  addTeamMember,
}));
vi.mock("@/features/booking/application/use-cases/update-team-member/update-team-member", () => ({
  updateTeamMember,
}));
vi.mock(
  "@/features/booking/application/use-cases/set-team-member-archived/set-team-member-archived",
  () => ({ setTeamMemberArchived }),
);
vi.mock("@/features/booking/application/use-cases/delete-team-member/delete-team-member", () => ({
  deleteTeamMember,
}));
vi.mock("../../auth/owner-guard/owner-guard", () => ({
  requireOwnerOrRedirect: vi.fn().mockResolvedValue({ id: "owner" }),
}));
vi.mock("../../workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn().mockResolvedValue({ context: { workspaceId: "ws-1" } }),
}));
vi.mock("../team-scope/team-scope", () => ({
  withTeamScope: (work: (scope: unknown) => Promise<unknown>) => work({ roles: {}, members: {} }),
}));

const { TeamError } = await import("@/features/booking/application/errors/team-errors/team-errors");
const {
  addWorkspaceTeamMember,
  addWorkspaceTeamRole,
  deleteWorkspaceTeamMember,
  deleteWorkspaceTeamRole,
  loadMoreTeamMembers,
  setWorkspaceTeamMemberArchived,
  updateWorkspaceTeamMember,
} = await import("./team-flow");

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

  it("AC-TEAM-022 treats a malformed member ID as not found without touching the database", async () => {
    await expect(updateWorkspaceTeamMember("ws-1", "nope", {})).rejects.toThrow("NEXT_NOT_FOUND");
    expect(updateTeamMember).not.toHaveBeenCalled();
  });

  it("AC-TEAM-022 treats a foreign role in a member body as not found", async () => {
    addTeamMember.mockRejectedValue(new TeamError("NOT_FOUND"));
    await expect(addWorkspaceTeamMember("ws-1", {})).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("AC-TEAM-003 treats a malformed load-more query as not found", async () => {
    await expect(loadMoreTeamMembers("ws-1", { status: "OTHER" })).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
  });

  it("AC-TEAM-023 C-103 logs no member data when a member write fails", async () => {
    addTeamMember.mockRejectedValue(new Error("database unavailable"));
    await expect(
      addWorkspaceTeamMember("ws-1", { name: "Rina", whatsappNumber: "0812", email: "r@x.id" }),
    ).rejects.toMatchObject({ code: "SAVE_FAILED" });
    expect(logger.error).toHaveBeenCalledWith("team.save_failed", {
      workspaceId: "ws-1",
      operation: "add-member",
    });
    const logged = JSON.stringify(logger.error.mock.calls);
    for (const secret of ["Rina", "0812", "r@x.id"]) expect(logged).not.toContain(secret);
  });

  it("AC-TEAM-023 C-103 logs only the workspace and operation when archive or delete fails", async () => {
    setTeamMemberArchived.mockRejectedValue(new Error("Dimas 6281298765432 unavailable"));
    deleteTeamMember.mockRejectedValue(new Error("Dimas 6281298765432 unavailable"));
    const memberId = crypto.randomUUID();
    await expect(setWorkspaceTeamMemberArchived("ws-1", memberId, true)).rejects.toMatchObject({
      code: "SAVE_FAILED",
    });
    await expect(deleteWorkspaceTeamMember("ws-1", memberId)).rejects.toMatchObject({
      code: "SAVE_FAILED",
    });
    expect(logger.error).toHaveBeenNthCalledWith(1, "team.save_failed", {
      workspaceId: "ws-1",
      operation: "archive-member",
    });
    expect(logger.error).toHaveBeenNthCalledWith(2, "team.save_failed", {
      workspaceId: "ws-1",
      operation: "delete-member",
    });
    expect(JSON.stringify(logger.error.mock.calls)).not.toContain("Dimas");
  });

  it("AC-TEAM-022 treats a malformed member ID as not found for archive and delete", async () => {
    await expect(setWorkspaceTeamMemberArchived("ws-1", "nope", true)).rejects.toThrow(
      "NEXT_NOT_FOUND",
    );
    await expect(deleteWorkspaceTeamMember("ws-1", "nope")).rejects.toThrow("NEXT_NOT_FOUND");
    expect(setTeamMemberArchived).not.toHaveBeenCalled();
    expect(deleteTeamMember).not.toHaveBeenCalled();
  });
});
