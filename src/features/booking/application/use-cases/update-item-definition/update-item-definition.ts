import "server-only";

import { normaliseCatalogName } from "@/features/booking/domain/catalog-name/catalog-name";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ItemDefinitionRepositoryPort } from "../../ports/item-definition-repository/item-definition-repository.port";
import { itemDefinitionSchema } from "../../schemas/item-definition/item-definition.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { CatalogWriteResult } from "../catalog-results/catalog-results.types";

export async function updateItemDefinition(
  repository: ItemDefinitionRepositoryPort,
  context: WorkspaceContext,
  id: string,
  editorUserId: string,
  input: unknown,
): Promise<CatalogWriteResult> {
  const parsed = itemDefinitionSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  const result = await repository.update(context, id, {
    ...parsed.data,
    name: normaliseCatalogName(parsed.data.name),
    editorUserId,
  });
  if (result === "NOT_FOUND") throw new CatalogError("NOT_FOUND");
  if (result === "NAME_TAKEN") {
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "NAME_TAKEN" } };
  }
  if (result === "LOCKED") {
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { valueType: "LOCKED" } };
  }
  return { ok: true };
}
