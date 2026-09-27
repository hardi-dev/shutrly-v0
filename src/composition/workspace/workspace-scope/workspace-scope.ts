import "server-only";

import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { WorkspaceScope } from "./workspace-scope.types";

/** Runs workspace application work with the request-scoped repository. @param work - workspace work over the repository @returns the work result */
export function withWorkspaceScope<T>(work: (scope: WorkspaceScope) => Promise<T>): Promise<T> {
  return withRequestDb((db) => work({ repository: createDrizzleWorkspaceRepository(db) }));
}
