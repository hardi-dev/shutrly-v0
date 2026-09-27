import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";

/** Reads a workspace profile through its verified tenant context. @param repository - workspace persistence port @param context - ownership-verified workspace context @returns the workspace profile or null */
export function getWorkspaceProfile(
  repository: Pick<WorkspaceRepositoryPort, "getProfile">,
  context: WorkspaceContext,
) {
  return repository.getProfile(context);
}
