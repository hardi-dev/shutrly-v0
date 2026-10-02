import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";
import type { CatalogDeleteResult } from "../catalog-results/catalog-results.types";

export async function deleteService(
  repository: ServiceRepositoryPort,
  context: WorkspaceContext,
  id: string,
): Promise<CatalogDeleteResult> {
  const result = await repository.delete(context, id);
  if (result === "NOT_FOUND") throw new CatalogError("NOT_FOUND");
  return result === "IN_USE" ? { ok: false, code: "IN_USE" } : { ok: true };
}
