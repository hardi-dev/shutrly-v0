import "server-only";

import { isTeamEditable } from "@/features/booking/domain/session-assignment/session-assignment";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { TeamError } from "../../errors/team-errors/team-errors";
import type { SessionAssignmentRepositoryPort } from "../../ports/session-assignment-repository/session-assignment-repository.port";
import { assignmentInputSchema } from "../../schemas/assignment-input/assignment-input.schema";
import type { AssignmentWriteResult } from "../team-results/team-results.types";
import type { AssignmentTarget } from "./add-session-assignment.types";

/**
 * Puts a member on a session in one role, after the repository has locked the project and checked
 * the session, the member and the role (BR-TEAM-006, AC-TEAM-011, AC-TEAM-013).
 * @param repository - the assignment repository
 * @param context - the verified workspace
 * @param actorId - the Owner making the change
 * @param target - the project and session from the route
 * @param input - the untrusted `{ memberId, roleId }`
 * @returns success, or the failure code for the form; throws `NOT_FOUND` for anything not in the workspace
 */
export async function addSessionAssignment(
  repository: SessionAssignmentRepositoryPort,
  context: WorkspaceContext,
  actorId: string,
  target: AssignmentTarget,
  input: unknown,
): Promise<AssignmentWriteResult> {
  const parsed = assignmentInputSchema.safeParse(input);
  if (!parsed.success) throw new TeamError("NOT_FOUND");
  const result = await repository.add(context, {
    ...target,
    ...parsed.data,
    actorId,
    isEditable: isTeamEditable,
  });
  if (result === "NOT_FOUND") throw new TeamError("NOT_FOUND");
  return result === "ADDED" ? { ok: true } : { ok: false, code: result };
}
