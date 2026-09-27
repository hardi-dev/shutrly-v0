import "server-only";

import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";
import type { ListedWorkspace } from "./list-owner-workspaces.types";

/** Lists an owner's workspaces alphabetically and marks the verified current workspace. @param repository - workspace persistence port @param owner - authenticated owner ID @param context - current verified workspace context @returns sorted workspace summaries with current-state flags */
export async function listOwnerWorkspaces(
  repository: Pick<WorkspaceRepositoryPort, "listForOwner">,
  owner: OwnerUserId,
  context: WorkspaceContext,
): Promise<readonly ListedWorkspace[]> {
  const workspaces = await repository.listForOwner(owner);
  return workspaces.map((workspace) => ({
    ...workspace,
    isCurrent: workspace.id === context.workspaceId,
  }));
}
