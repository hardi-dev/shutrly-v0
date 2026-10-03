import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const addWorkspaceTeamRole = vi.fn();
const renameWorkspaceTeamRole = vi.fn();
const deleteWorkspaceTeamRole = vi.fn();
const addWorkspaceTeamMember = vi.fn();
const updateWorkspaceTeamMember = vi.fn();
const loadMoreTeamMembers = vi.fn();

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/composition/booking/team-flow/team-flow", () => ({
  addWorkspaceTeamRole,
  renameWorkspaceTeamRole,
  deleteWorkspaceTeamRole,
  addWorkspaceTeamMember,
  updateWorkspaceTeamMember,
  loadMoreTeamMembers,
}));

const {
  addTeamMemberAction,
  addTeamRoleAction,
  deleteTeamRoleAction,
  loadMoreTeamMembersAction,
  renameTeamRoleAction,
  updateTeamMemberAction,
} = await import("./team");

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

  it("AC-TEAM-004 revalidates the team layout after a member is added", async () => {
    addWorkspaceTeamMember.mockResolvedValue({ ok: true, member: { id: "m1", name: "Rina" } });
    await expect(addTeamMemberAction("ws-1", {})).resolves.toMatchObject({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/team", "layout");
  });

  it("AC-TEAM-005 passes bypassed input to the flow and returns its field errors unrevalidated", async () => {
    const failure = { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "EMPTY" } };
    addWorkspaceTeamMember.mockResolvedValue(failure);
    const bypassed = { name: "", whatsappNumber: "", email: "", roleIds: [] };
    await expect(addTeamMemberAction("ws-1", bypassed)).resolves.toEqual(failure);
    expect(addWorkspaceTeamMember).toHaveBeenCalledWith("ws-1", bypassed);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("AC-TEAM-004 also revalidates the projects layout after a member edit", async () => {
    updateWorkspaceTeamMember.mockResolvedValue({ ok: true });
    await expect(updateTeamMemberAction("ws-1", "m1", {})).resolves.toBeUndefined();
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/team", "layout");
    expect(revalidatePath).toHaveBeenCalledWith("/w/[workspaceId]/projects", "layout");
  });

  it("AC-TEAM-006 returns the number-taken failure from an edit", async () => {
    const failure = {
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { whatsappNumber: "TAKEN" },
      numberHolder: { name: "Ayu", isArchived: true },
    };
    updateWorkspaceTeamMember.mockResolvedValue(failure);
    await expect(updateTeamMemberAction("ws-1", "m1", {})).resolves.toEqual(failure);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("AC-TEAM-003 loads more members through the flow", async () => {
    loadMoreTeamMembers.mockResolvedValue({ items: [], nextCursor: null });
    await expect(loadMoreTeamMembersAction("ws-1", { status: "ACTIVE" })).resolves.toEqual({
      items: [],
      nextCursor: null,
    });
  });
});
