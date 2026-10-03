import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ProjectRepositoryPort } from "../../ports/project-repository/project-repository.port";
import type { CreateOptions } from "./load-create-options.types";

/** Loads what the Proyek baru form needs: active services grouped by category with their items and fields (AC-PRJ-006). @param repository - project port @param context - verified workspace @returns the service groups */
export async function loadCreateOptions(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
): Promise<CreateOptions> {
  const [serviceGroups, definitions] = await Promise.all([
    repository.listActiveServiceOptions(context),
    repository.listActiveDefinitions(context),
  ]);
  return {
    serviceGroups,
    hasActiveService: serviceGroups.some((group) => group.services.length > 0),
    definitions,
  };
}
