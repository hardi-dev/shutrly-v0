import "server-only";

import { createDrizzleWorkspaceSourceRepository } from "@/adapters/db/workspace-source-repository/drizzle-workspace-source-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { SourceConfigScope } from "./source-config-scope.types";

export function withSourceConfigScope<T>(
  work: (scope: SourceConfigScope) => Promise<T>,
): Promise<T> {
  return withRequestDb((db) => work({ sources: createDrizzleWorkspaceSourceRepository(db) }));
}
