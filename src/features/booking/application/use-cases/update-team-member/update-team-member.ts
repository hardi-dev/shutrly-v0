import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { TeamError } from "../../errors/team-errors/team-errors";
import type { TeamMemberRepositoryPort } from "../../ports/team-member-repository/team-member-repository.port";
import { teamMemberInputSchema } from "../../schemas/team-member-input/team-member-input.schema";
import { teamMemberNumberTaken, teamMemberValidationFailure } from "../team-results/team-results";
import type { TeamMemberWriteResult } from "../team-results/team-results.types";

/**
 * Saves a member's fields and roles after validating every field (AC-TEAM-004, AC-TEAM-007).
 * @param repository - the member repository
 * @param context - the verified workspace
 * @param editorUserId - the Owner making the change
 * @param id - the member to change
 * @param input - the untrusted form values
 * @returns success, or the field errors
 */
export async function updateTeamMember(
  repository: TeamMemberRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  id: string,
  input: unknown,
): Promise<TeamMemberWriteResult> {
  const parsed = teamMemberInputSchema.safeParse(input);
  if (!parsed.success) return teamMemberValidationFailure(parsed.error.issues);
  const result = await repository.update(context, id, { ...parsed.data, editorUserId });
  if (result === "NOT_FOUND") throw new TeamError("NOT_FOUND");
  if (result === "UPDATED") return { ok: true };
  return teamMemberNumberTaken(result.holder);
}
