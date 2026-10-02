import "server-only";

import type { ClientStatus } from "@/features/booking/domain/client-list/client-list.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ClientRepositoryPort } from "../../ports/client-repository/client-repository.port";

export function countClients(
  repository: ClientRepositoryPort,
  context: WorkspaceContext,
  status: ClientStatus,
): Promise<number> {
  return repository.count(context, status);
}
