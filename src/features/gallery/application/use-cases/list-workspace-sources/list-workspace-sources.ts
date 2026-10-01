import "server-only";

import { sortSources } from "@/features/gallery/domain/source-order/source-order";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  WorkspaceSourceRecord,
  WorkspaceSourceRepositoryPort,
} from "../../ports/workspace-source-repository/workspace-source-repository.port";

export async function listWorkspaceSources(
  repository: WorkspaceSourceRepositoryPort,
  context: WorkspaceContext,
): Promise<WorkspaceSourceRecord[]> {
  return sortSources(await repository.listForWorkspace(context));
}
