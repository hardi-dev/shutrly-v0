import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeSessionAssignmentRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { addSessionAssignment } from "./add-session-assignment";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const target = { projectId: crypto.randomUUID(), sessionId: crypto.randomUUID() };
const input = { memberId: crypto.randomUUID(), roleId: crypto.randomUUID() };

describe("addSessionAssignment", () => {
  it("AC-TEAM-011 passes the route ids, the body and the editable rule to the repository", async () => {
    const repository = new FakeSessionAssignmentRepository();
    expect(await addSessionAssignment(repository, context, "owner", target, input)).toEqual({
      ok: true,
    });
    expect(repository.calls[0]).toMatchObject({ ...target, ...input, actorId: "owner" });
    expect(repository.calls[0]?.isEditable("BOOKED")).toBe(true);
    expect(repository.calls[0]?.isEditable("CANCELLED")).toBe(false);
  });

  it.each(["ALREADY_ASSIGNED", "MEMBER_ARCHIVED", "ROLE_NOT_HELD", "PROJECT_CANCELLED"] as const)(
    "AC-TEAM-013 returns %s as a failure code",
    async (code) => {
      const repository = new FakeSessionAssignmentRepository();
      repository.result = code;
      expect(await addSessionAssignment(repository, context, "owner", target, input)).toEqual({
        ok: false,
        code,
      });
    },
  );

  it("AC-TEAM-022 throws not found when the repository cannot find a part", async () => {
    const repository = new FakeSessionAssignmentRepository();
    repository.result = "NOT_FOUND";
    await expect(
      addSessionAssignment(repository, context, "owner", target, input),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("AC-TEAM-022 treats a malformed member or role id as not found without a write", async () => {
    const repository = new FakeSessionAssignmentRepository();
    await expect(
      addSessionAssignment(repository, context, "owner", target, { memberId: "x", roleId: "y" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(repository.calls).toHaveLength(0);
  });
});
