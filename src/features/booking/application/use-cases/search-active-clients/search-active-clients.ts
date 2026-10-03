import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  ClientOption,
  ProjectRepositoryPort,
} from "../../ports/project-repository/project-repository.port";

export const CLIENT_PICKER_LIMIT = 8;

/** Finds active clients for the project client picker; a blank query lists the first few by name (TD-A-3). @param repository - project port @param context - verified workspace @param query - what the Owner typed @returns up to eight matching active clients */
export function searchActiveClients(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  query: string,
): Promise<readonly ClientOption[]> {
  return repository.searchActiveClients(context, query.trim(), CLIENT_PICKER_LIMIT);
}
