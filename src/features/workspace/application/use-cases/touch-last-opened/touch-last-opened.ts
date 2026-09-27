import "server-only";

import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";

/** Touches a verified workspace only when it is not already the owner's latest workspace. @param repository - workspace persistence port @param owner - authenticated owner ID @param context - ownership-verified workspace context @returns whether the row was updated */
export function touchLastOpened(
  repository: Pick<WorkspaceRepositoryPort, "touchIfNotLatest">,
  owner: OwnerUserId,
  context: WorkspaceContext,
): Promise<boolean> {
  return repository.touchIfNotLatest(owner, context);
}
