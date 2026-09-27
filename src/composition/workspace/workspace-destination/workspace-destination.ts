import "server-only";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleWorkspaceRepository } from "@/adapters/db/workspace-repository/drizzle-workspace-repository";
import type { WorkspaceDestinationPort } from "@/features/auth/application/ports/workspace-destination/workspace-destination.port";
import { resolveOwnerDestination } from "@/features/workspace/application/use-cases/resolve-owner-destination/resolve-owner-destination";
import { asOwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id";

/** Adapts F-01's authenticated user ID to F-02's owner workspace destination port. @param db - request-scoped database @returns the destination port */
export function createWorkspaceDestination(db: Db): WorkspaceDestinationPort {
  const repository = createDrizzleWorkspaceRepository(db);
  return {
    resolve: (userId) => resolveOwnerDestination(repository, asOwnerUserId(userId)),
  };
}
