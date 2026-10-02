import "server-only";

import { normaliseCatalogName } from "@/features/booking/domain/catalog-name/catalog-name";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { CategoryRepositoryPort } from "../../ports/category-repository/category-repository.port";
import { catalogNameSchema } from "../../schemas/catalog-name/catalog-name.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { CatalogWriteResult } from "../catalog-results/catalog-results.types";

export async function renameCategory(
  repository: CategoryRepositoryPort,
  context: WorkspaceContext,
  id: string,
  editorUserId: string,
  input: unknown,
): Promise<CatalogWriteResult> {
  const parsed = catalogNameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  const result = await repository.rename(context, {
    id,
    name: normaliseCatalogName(parsed.data.name),
    editorUserId,
  });
  if (result === "NOT_FOUND") throw new CatalogError("NOT_FOUND");
  return result === "NAME_TAKEN"
    ? { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "NAME_TAKEN" } }
    : { ok: true };
}
