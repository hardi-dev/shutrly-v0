import { describe, expect, it } from "vitest";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { FakeSessionAssignmentRepository } from "../../../../../../tests/support/booking/fake-team-repositories";
import { removeSessionAssignment } from "./remove-session-assignment";

const context = { workspaceId: "workspace-a" } as unknown as WorkspaceContext;
const projectId = crypto.randomUUID();
const assignmentId = crypto.randomUUID();

describe("removeSessionAssignment", () => {
  it("AC-TEAM-014 passes the route project, the assignment and the editable rule", async () => {
    const repository = new FakeSessionAssignmentRepository();
    expect(await removeSessionAssignment(repository, context, projectId, assignmentId)).toEqual({
      ok: true,
    });
    expect(repository.removeCalls[0]).toMatchObject({ projectId, assignmentId });
    expect(repository.removeCalls[0]?.isEditable("BOOKED")).toBe(true);
    expect(repository.removeCalls[0]?.isEditable("CANCELLED")).toBe(false);
  });

  it("AC-TEAM-015 returns PROJECT_CANCELLED as a failure code", async () => {
    const repository = new FakeSessionAssignmentRepository();
    repository.removeResult = "PROJECT_CANCELLED";
    expect(await removeSessionAssignment(repository, context, projectId, assignmentId)).toEqual({
      ok: false,
      code: "PROJECT_CANCELLED",
    });
  });

  it("AC-TEAM-022 throws not found for an assignment outside the project or workspace", async () => {
    const repository = new FakeSessionAssignmentRepository();
    repository.removeResult = "NOT_FOUND";
    await expect(
      removeSessionAssignment(repository, context, projectId, assignmentId),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
