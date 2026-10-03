import "server-only";

import { PROJECT_SEARCH_MAX_LENGTH } from "@/features/booking/domain/project-record/project-record";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  FilterClientOption,
  FilterServiceOption,
  ProjectRepositoryPort,
} from "../../ports/project-repository/project-repository.port";

export const FILTER_CLIENT_LIMIT = 8;

/** Lists every service for the filter, archived ones included (A-11). @param repository - project port @param context - verified workspace @returns the services by name */
export function loadFilterServices(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
): Promise<readonly FilterServiceOption[]> {
  return repository.listServicesForFilter(context);
}

/** Searches active and archived clients for the filter's Klien field, at most 8 (TD-A-4). @param repository - project port @param context - verified workspace @param query - the typed text @returns the matching clients */
export function searchFilterClients(
  repository: ProjectRepositoryPort,
  context: WorkspaceContext,
  query: unknown,
): Promise<readonly FilterClientOption[]> {
  const text = typeof query === "string" ? query.slice(0, PROJECT_SEARCH_MAX_LENGTH) : "";
  return repository.searchClientsForFilter(context, text.trim(), FILTER_CLIENT_LIMIT);
}
