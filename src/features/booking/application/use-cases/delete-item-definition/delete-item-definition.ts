import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ItemDefinitionRepositoryPort } from "../../ports/item-definition-repository/item-definition-repository.port";
import type { CatalogDeleteResult } from "../catalog-results/catalog-results.types";

export async function deleteItemDefinition(
  repository: ItemDefinitionRepositoryPort,
  context: WorkspaceContext,
  id: string,
): Promise<CatalogDeleteResult> {
  const result = await repository.delete(context, id);
  if (result === "NOT_FOUND") throw new CatalogError("NOT_FOUND");
  return result === "IN_USE" ? { ok: false, code: "IN_USE" } : { ok: true };
}
