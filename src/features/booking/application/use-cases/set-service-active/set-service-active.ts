import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";

export async function setServiceActive(
  repository: ServiceRepositoryPort,
  context: WorkspaceContext,
  id: string,
  editorUserId: string,
  isActive: boolean,
): Promise<{ readonly ok: true }> {
  if (!(await repository.setActive(context, { id, isActive, editorUserId }))) {
    throw new CatalogError("NOT_FOUND");
  }
  return { ok: true };
}
