import "server-only";

import { normaliseCatalogName } from "@/features/booking/domain/catalog-name/catalog-name";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";
import { serviceInfoSchema } from "../../schemas/service-info/service-info.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { ServiceWriteResult } from "../service-results/service-results.types";

export async function updateServiceInfo(
  repository: ServiceRepositoryPort,
  context: WorkspaceContext,
  id: string,
  editorUserId: string,
  input: unknown,
): Promise<ServiceWriteResult> {
  const parsed = serviceInfoSchema.safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  const result = await repository.updateInfo(context, id, {
    ...parsed.data,
    name: normaliseCatalogName(parsed.data.name),
    editorUserId,
  });
  if (result === "NOT_FOUND") throw new CatalogError("NOT_FOUND");
  if (result === "NAME_TAKEN")
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "NAME_TAKEN" } };
  if (result === "INACTIVE_REFERENCE")
    return {
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { categoryId: "INACTIVE_REFERENCE" },
    };
  return { ok: true };
}
