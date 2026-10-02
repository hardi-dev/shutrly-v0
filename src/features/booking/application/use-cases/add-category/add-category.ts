import "server-only";

import { normaliseCatalogName } from "@/features/booking/domain/catalog-name/catalog-name";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { CategoryRepositoryPort } from "../../ports/category-repository/category-repository.port";
import { catalogNameSchema } from "../../schemas/catalog-name/catalog-name.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { CatalogWriteResult } from "../catalog-results/catalog-results.types";

export async function addCategory(
  repository: CategoryRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  input: unknown,
): Promise<CatalogWriteResult> {
  const parsed = catalogNameSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  const result = await repository.create(
    context,
    normaliseCatalogName(parsed.data.name),
    editorUserId,
  );
  return result.status === "NAME_TAKEN"
    ? { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "NAME_TAKEN" } }
    : { ok: true };
}
