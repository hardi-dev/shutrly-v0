import "server-only";

import { normaliseCatalogName } from "@/features/booking/domain/catalog-name/catalog-name";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";
import { createServiceInfoSchema } from "../../schemas/service-info/service-info.schema";
import { validationFailure } from "../catalog-results/catalog-results";
import type { ServiceWriteResult } from "../service-results/service-results.types";

export async function addService(
  repository: ServiceRepositoryPort,
  context: WorkspaceContext,
  editorUserId: string,
  input: unknown,
  locale: FormattingLocale,
): Promise<ServiceWriteResult> {
  const parsed = createServiceInfoSchema(locale).safeParse(input);
  if (!parsed.success) return validationFailure(parsed.error.issues[0]);
  const result = await repository.create(context, {
    ...parsed.data,
    name: normaliseCatalogName(parsed.data.name),
    editorUserId,
  });
  if (result.status === "NAME_TAKEN") {
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { name: "NAME_TAKEN" } };
  }
  if (result.status === "INACTIVE_REFERENCE") {
    return {
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { categoryId: "INACTIVE_REFERENCE" },
    };
  }
  return { ok: true, serviceId: result.id };
}
