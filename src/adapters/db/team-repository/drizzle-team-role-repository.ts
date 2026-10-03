import "server-only";

import type { TeamRoleRepositoryPort } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

import type { DbExecutor } from "../client/client.types";
import { teamRole } from "../schema/booking/team";

/**
 * Drizzle implementation of the team-role port.
 * @param db - the request database or a transaction
 * @returns a repository scoped by the context passed to each call
 */
export function createDrizzleTeamRoleRepository(db: DbExecutor): TeamRoleRepositoryPort {
  return {
    async seedDefaults(context, names) {
      if (names.length === 0) return;
      await db
        .insert(teamRole)
        .values(names.map((name) => ({ workspaceId: context.workspaceId, name })))
        .onConflictDoNothing();
    },
  };
}
