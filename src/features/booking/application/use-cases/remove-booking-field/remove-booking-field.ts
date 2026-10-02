import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";

export async function removeBookingField(
  repository: ServiceRepositoryPort,
  context: WorkspaceContext,
  serviceId: string,
  fieldId: string,
): Promise<{ readonly ok: true }> {
  if (!(await repository.removeField(context, serviceId, fieldId)))
    throw new CatalogError("NOT_FOUND");
  return { ok: true };
}
