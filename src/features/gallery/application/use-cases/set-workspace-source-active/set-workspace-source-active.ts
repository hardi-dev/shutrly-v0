import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { SourceConfigError } from "../../errors/source-config-errors/source-config-errors";
import type { WorkspaceSourceRepositoryPort } from "../../ports/workspace-source-repository/workspace-source-repository.port";

export async function setWorkspaceSourceActive(
  repository: WorkspaceSourceRepositoryPort,
  context: WorkspaceContext,
  sourceId: string,
  editorUserId: string,
  isActive: boolean,
): Promise<{ readonly ok: true }> {
  const updated = await repository.setActive(context, { id: sourceId, isActive, editorUserId });
  if (!updated) throw new SourceConfigError("NOT_FOUND");
  return { ok: true };
}
