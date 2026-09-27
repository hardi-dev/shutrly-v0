import "server-only";

import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";

import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";
import type { OwnerDestination } from "./resolve-owner-destination.types";

/** Resolves whether an owner needs onboarding or can enter an existing workspace. @param repository - workspace persistence port @param owner - authenticated owner ID @returns the next owner destination */
export async function resolveOwnerDestination(
  repository: Pick<WorkspaceRepositoryPort, "countForOwner">,
  owner: OwnerUserId,
): Promise<OwnerDestination> {
  return (await repository.countForOwner(owner)) > 0 ? "WORKSPACE" : "ONBOARDING";
}
