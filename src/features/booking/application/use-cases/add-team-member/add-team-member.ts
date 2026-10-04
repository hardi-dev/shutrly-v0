import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { TeamError } from "../../errors/team-errors/team-errors";
import type { TeamMemberRepositoryPort } from "../../ports/team-member-repository/team-member-repository.port";
import { teamMemberInputSchema } from "../../schemas/team-member-input/team-member-input.schema";
import { teamMemberNumberTaken, teamMemberValidationFailure } from "../team-results/team-results";
import type { TeamMemberWriteResult } from "../team-results/team-results.types";

/**
 * Adds a member with its roles after validating every field (AC-TEAM-004, AC-TEAM-005, AC-TEAM-006).
 * @param repository - the member repository
 * @param context - the verified workspace
 * @param editorUserId - the Owner making the change
 * @param input - the untrusted form values
 * @returns the created member, or the field errors
 */
export async function addTeamMember(
  repository: TeamMemberRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  input: unknown,
): Promise<TeamMemberWriteResult> {
  const parsed = teamMemberInputSchema.safeParse(input);
  if (!parsed.success) return teamMemberValidationFailure(parsed.error.issues);
  const result = await repository.create(context, { ...parsed.data, editorUserId });
  if (result === "NOT_FOUND") throw new TeamError("NOT_FOUND");
  if (result.status === "NUMBER_TAKEN") return teamMemberNumberTaken(result.holder);
  return { ok: true, member: { id: result.id, name: parsed.data.name } };
}
