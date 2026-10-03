import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const addWorkspaceTeamRole = vi.fn();
const renameWorkspaceTeamRole = vi.fn();
const deleteWorkspaceTeamRole = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/booking/team-flow/team-flow", () => ({
  addWorkspaceTeamRole,
  renameWorkspaceTeamRole,
  deleteWorkspaceTeamRole,
}));

const { addTeamRoleAction, deleteTeamRoleAction, renameTeamRoleAction } = await import("./team");

describe("team actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("AC-TEAM-009 revalidates the team layout after a successful role add", async () => {
    addWorkspaceTeamRole.mockResolvedValue({ ok: true, role: { id: "r1", name: "Editor" } });
    await addTeamRoleAction("ws-1", {});
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/team", "layout");
  });

  it("AC-TEAM-009 returns a duplicate-name failure without revalidating", async () => {
    const failure = { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "DUPLICATE" } };
    addWorkspaceTeamRole.mockResolvedValue(failure);
    await expect(addTeamRoleAction("ws-1", {})).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("AC-TEAM-009 also revalidates the projects layout after a rename", async () => {
    renameWorkspaceTeamRole.mockResolvedValue({ ok: true });
    await expect(renameTeamRoleAction("ws-1", "r1", {})).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/team", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-TEAM-009 does not revalidate when a role is in use", async () => {
    const blocked = { ok: false, code: "IN_USE", usage: 2 };
    deleteWorkspaceTeamRole.mockResolvedValue(blocked);
    await expect(deleteTeamRoleAction("ws-1", "r1")).resolves.toEqual(blocked);
    expect(revalidatePath).not.toHaveBeenCalled();
  });
});
