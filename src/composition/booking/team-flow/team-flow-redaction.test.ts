import { beforeEach, describe, expect, it, vi } from "vitest";

const { fail, logger } = vi.hoisted(() => ({
  fail: vi.fn(),
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock("@/shared/logging/logger", () => ({ logger }));
vi.mock("next/navigation", () => ({ notFound: vi.fn() }));
vi.mock("../../auth/owner-guard/owner-guard", () => ({
  requireOwnerOrRedirect: vi.fn().mockResolvedValue({ id: "owner" }),
}));
vi.mock("../../workspace/owner-workspace/owner-workspace", () => ({
  verifyOwnerWorkspace: vi.fn().mockResolvedValue({ context: { workspaceId: "ws-1" } }),
}));
vi.mock("../team-scope/team-scope", () => ({
  withTeamScope: (work: (scope: unknown) => Promise<unknown>) =>
    work({ roles: {}, members: {}, assignments: {} }),
}));

vi.mock(
  "@/features/booking/application/use-cases/add-session-assignment/add-session-assignment",
  () => ({ addSessionAssignment: fail }),
);
vi.mock("@/features/booking/application/use-cases/add-team-member/add-team-member", () => ({
  addTeamMember: fail,
}));
vi.mock("@/features/booking/application/use-cases/add-team-role/add-team-role", () => ({
  addTeamRole: fail,
}));
vi.mock("@/features/booking/application/use-cases/count-team-members/count-team-members", () => ({
  countTeamMembers: fail,
}));
vi.mock("@/features/booking/application/use-cases/delete-team-member/delete-team-member", () => ({
  deleteTeamMember: fail,
}));
vi.mock("@/features/booking/application/use-cases/delete-team-role/delete-team-role", () => ({
  deleteTeamRole: fail,
}));
vi.mock(
  "@/features/booking/application/use-cases/list-assignable-members/list-assignable-members",
  () => ({ listAssignableMembers: fail }),
);
vi.mock("@/features/booking/application/use-cases/list-team-members/list-team-members", () => ({
  listTeamMembers: fail,
}));
vi.mock("@/features/booking/application/use-cases/list-team-roles/list-team-roles", () => ({
  listTeamRoles: fail,
}));
vi.mock(
  "@/features/booking/application/use-cases/remove-session-assignment/remove-session-assignment",
  () => ({ removeSessionAssignment: fail }),
);
vi.mock("@/features/booking/application/use-cases/rename-team-role/rename-team-role", () => ({
  renameTeamRole: fail,
}));
vi.mock(
  "@/features/booking/application/use-cases/set-team-member-archived/set-team-member-archived",
  () => ({ setTeamMemberArchived: fail }),
);
vi.mock("@/features/booking/application/use-cases/update-team-member/update-team-member", () => ({
  updateTeamMember: fail,
}));

const flow = await import("./team-flow");

const WORKSPACE = "ws-1";
const ID = crypto.randomUUID();
const SECRET = "Dimas Pratama 6281298765432 dimas@example.com";
const QUERY = { status: "ACTIVE", q: "", afterId: null };

const ENTRIES: ReadonlyArray<readonly [string, () => Promise<unknown>]> = [
  ["list-roles", () => flow.loadTeamRoles(WORKSPACE)],
  ["add-role", () => flow.addWorkspaceTeamRole(WORKSPACE, {})],
  ["rename-role", () => flow.renameWorkspaceTeamRole(WORKSPACE, ID, {})],
  ["delete-role", () => flow.deleteWorkspaceTeamRole(WORKSPACE, ID)],
  ["list-members", () => flow.loadTeamMembers(WORKSPACE, "ACTIVE", "dimas")],
  ["list-members", () => flow.loadMoreTeamMembers(WORKSPACE, QUERY)],
  ["add-member", () => flow.addWorkspaceTeamMember(WORKSPACE, {})],
  ["update-member", () => flow.updateWorkspaceTeamMember(WORKSPACE, ID, {})],
  ["archive-member", () => flow.setWorkspaceTeamMemberArchived(WORKSPACE, ID, true)],
  ["delete-member", () => flow.deleteWorkspaceTeamMember(WORKSPACE, ID)],
  ["list-assignable", () => flow.loadAssignableMembers(WORKSPACE)],
  ["add-assignment", () => flow.addSessionAssignmentEntry(WORKSPACE, ID, ID, {})],
  ["remove-assignment", () => flow.removeSessionAssignmentEntry(WORKSPACE, ID, ID)],
];

describe("team-flow log redaction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    fail.mockRejectedValue(new Error(SECRET));
  });

  it.each(ENTRIES)(
    "AC-TEAM-023 C-103 %s logs team.save_failed with IDs only and throws SAVE_FAILED",
    async (operation, call) => {
      await expect(call()).rejects.toMatchObject({ code: "SAVE_FAILED" });
      expect(logger.error).toHaveBeenCalledTimes(1);
      const [message, payload] = logger.error.mock.calls[0] as [string, Record<string, string>];
      expect(message).toBe("team.save_failed");
      expect(payload).toMatchObject({ workspaceId: WORKSPACE, operation });
      expect(
        Object.keys(payload).every((key) =>
          ["workspaceId", "operation", "projectId"].includes(key),
        ),
      ).toBe(true);
      expect(JSON.stringify(logger.error.mock.calls)).not.toMatch(
        /Dimas|6281298765432|example\.com|dimas/i,
      );
    },
  );
});
