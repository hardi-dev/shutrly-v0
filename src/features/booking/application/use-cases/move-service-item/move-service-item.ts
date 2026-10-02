import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";
import { moveDirectionSchema } from "../../schemas/move-direction/move-direction.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { CatalogWriteResult } from "../catalog-results/catalog-results.types";

export async function moveServiceItem(
  repository: ServiceRepositoryPort,
  context: WorkspaceContext,
  serviceId: string,
  itemId: string,
  input: unknown,
): Promise<CatalogWriteResult> {
  const parsed = moveDirectionSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  if (!(await repository.moveItem(context, serviceId, itemId, parsed.data))) {
    throw new CatalogError("NOT_FOUND");
  }
  return { ok: true };
}
