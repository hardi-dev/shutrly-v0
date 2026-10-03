import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  ProjectRepositoryPort,
  ServiceOptionGroup,
} from "../../ports/project-repository/project-repository.port";

/** Loads what the Proyek baru form needs: active services grouped by category with their items and fields (AC-PRJ-006). @param repository - project port @param context - verified workspace @returns the service groups */
export async function loadCreateOptions(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
): Promise<{ readonly serviceGroups: readonly ServiceOptionGroup[] }> {
  return { serviceGroups: await repository.listActiveServiceOptions(context) };
}
