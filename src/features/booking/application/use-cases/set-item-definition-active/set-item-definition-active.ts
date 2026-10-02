import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ItemDefinitionRepositoryPort } from "../../ports/item-definition-repository/item-definition-repository.port";

export async function setItemDefinitionActive(
  repository: ItemDefinitionRepositoryPort,
  context: WorkspaceContext,
  id: string,
  editorUserId: string,
  isActive: boolean,
): Promise<{ readonly ok: true }> {
  const updated = await repository.setActive(context, { id, isActive, editorUserId });
  if (!updated) throw new CatalogError("NOT_FOUND");
  return { ok: true };
}
