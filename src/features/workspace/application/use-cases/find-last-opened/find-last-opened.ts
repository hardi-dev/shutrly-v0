import "server-only";

import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";

import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";

/** Finds the workspace most recently opened by an owner without writing state. @param repository - workspace persistence port @param owner - authenticated owner ID @returns the last-opened workspace or null */
export function findLastOpened(
  repository: Pick<WorkspaceRepositoryPort, "findLastOpened">,
  owner: OwnerUserId,
) {
  return repository.findLastOpened(owner);
}
