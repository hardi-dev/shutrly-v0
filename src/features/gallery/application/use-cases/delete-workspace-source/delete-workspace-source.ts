import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { SourceConfigError } from "../../errors/source-config-errors/source-config-errors";
import type { WorkspaceSourceRepositoryPort } from "../../ports/workspace-source-repository/workspace-source-repository.port";
import type { DeleteSourceResult } from "./delete-workspace-source.types";

export async function deleteWorkspaceSource(
  repository: WorkspaceSourceRepositoryPort,
  context: WorkspaceContext,
  sourceId: string,
): Promise<DeleteSourceResult> {
  const outcome = await repository.delete(context, sourceId);
  if (outcome === "NOT_FOUND") throw new SourceConfigError("NOT_FOUND");
  if (outcome === "IN_USE") return { ok: false, code: "IN_USE" };
  return { ok: true };
}
