import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  AssignableMember,
  TeamMemberRepositoryPort,
} from "../../ports/team-member-repository/team-member-repository.port";

/**
 * Lists the active members with their roles for the Penugasan form (AC-TEAM-011, AC-TEAM-027).
 * @param repository - the member repository
 * @param context - the verified workspace
 * @returns the active members by name
 */
export function listAssignableMembers(
  repository: TeamMemberRepositoryPort,
  context: WorkspaceContext,
): Promise<readonly AssignableMember[]> {
  return repository.listAssignable(context);
}
