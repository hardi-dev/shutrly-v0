import "server-only";

import type { OwnerUserId } from "@/features/workspace/domain/owner-user-id/owner-user-id.types";
import { workspaceIdSchema } from "@/shared/workspace-context/workspace-context.schema";

import { WorkspaceError } from "../../errors/workspace-errors/workspace-errors";
import type { WorkspaceRepositoryPort } from "../../ports/workspace-repository/workspace-repository.port";
import type { VerifiedWorkspace } from "./verify-workspace.types";

/** Verifies that an opaque route ID belongs to the authenticated owner and produces the workspace context. @param repository - workspace persistence port @param owner - authenticated owner ID @param rawId - untrusted route or form ID @returns the verified context and summary @throws WorkspaceError when the ID is malformed or not owned */
export async function verifyWorkspace(
  repository: Pick<WorkspaceRepositoryPort, "findForOwner">,
  owner: OwnerUserId,
  rawId: string,
): Promise<VerifiedWorkspace> {
  const parsed = workspaceIdSchema.safeParse(rawId);
  if (!parsed.success) throw new WorkspaceError("WORKSPACE_NOT_FOUND");
  const workspace = await repository.findForOwner(owner, parsed.data);
  if (!workspace) throw new WorkspaceError("WORKSPACE_NOT_FOUND");
  return { context: { workspaceId: parsed.data }, workspace };
}
