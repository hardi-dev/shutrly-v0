import "server-only";

import { normaliseCatalogName } from "@/features/booking/domain/catalog-name/catalog-name";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ItemDefinitionRepositoryPort } from "../../ports/item-definition-repository/item-definition-repository.port";
import { itemDefinitionSchema } from "../../schemas/item-definition/item-definition.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { CatalogWriteResult } from "../catalog-results/catalog-results.types";

export async function addItemDefinition(
  repository: ItemDefinitionRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  input: unknown,
): Promise<CatalogWriteResult> {
  const parsed = itemDefinitionSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  const result = await repository.create(context, {
    ...parsed.data,
    name: normaliseCatalogName(parsed.data.name),
    editorUserId,
  });
  return result === "NAME_TAKEN"
    ? { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "NAME_TAKEN" } }
    : { ok: true };
}
