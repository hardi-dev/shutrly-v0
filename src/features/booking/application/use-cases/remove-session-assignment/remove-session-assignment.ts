import "server-only";

import { isTeamEditable } from "@/features/booking/domain/session-assignment/session-assignment";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { TeamError } from "../../errors/team-errors/team-errors";
import type { SessionAssignmentRepositoryPort } from "../../ports/session-assignment-repository/session-assignment-repository.port";
import type { RemoveAssignmentWriteResult } from "../team-results/team-results.types";

/**
 * Takes a member off a session after the repository has locked the project (BR-TEAM-006, AC-TEAM-014).
 * @param repository - the assignment repository
 * @param context - the verified workspace
 * @param projectId - the project from the route
 * @param assignmentId - the assignment to remove
 * @returns success, or `PROJECT_CANCELLED`; throws `NOT_FOUND` for an assignment outside the project
 */
export async function removeSessionAssignment(
  repository: SessionAssignmentRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
  assignmentId: string,
): Promise<RemoveAssignmentWriteResult> {
  const result = await repository.remove(context, {
    projectId,
    assignmentId,
    isEditable: isTeamEditable,
  });
  if (result === "NOT_FOUND") throw new TeamError("NOT_FOUND");
  return result === "REMOVED" ? { ok: true } : { ok: false, code: "PROJECT_CANCELLED" };
}
