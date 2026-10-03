import "server-only";

import { createDrizzleTeamRoleRepository } from "@/adapters/db/team-repository/drizzle-team-role-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { TeamScope } from "./team-scope.types";

/**
 * Runs team work against the team repositories on the request database.
 * @param work - the work over the scope's repositories
 * @returns the work result
 */
export function withTeamScope<T>(work: (scope: TeamScope) => Promise<T>): Promise<T> {
  return withRequestDb((db) => work({ roles: createDrizzleTeamRoleRepository(db) }));
}
