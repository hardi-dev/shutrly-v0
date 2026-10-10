import "server-only";

import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ItemDefinitionRepositoryPort } from "../../ports/item-definition-repository/item-definition-repository.port";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";
import { parsePackageValue } from "../service-results/service-results";
import type { ServiceItemWriteResult } from "../service-results/service-results.types";

export async function updateServiceItemValue(
  repository: ServiceRepositoryPort,
  definitions: ItemDefinitionRepositoryPort,
  context: WorkspaceContext,
  serviceId: string,
  itemId: string,
  definitionId: string,
  editorUserId: string,
  input: unknown,
  locale: FormattingLocale,
): Promise<ServiceItemWriteResult> {
  const definition = await definitions.findById(context, definitionId);
  if (!definition)
    return { ok: false, code: "VALIDATION_FAILED", fieldErrors: { definitionId: "NOT_FOUND" } };
  const value = parsePackageValue(input, definition, locale);
  if (!value.ok) return value;
  const result = await repository.updateItemValue(
    context,
    serviceId,
    itemId,
    value.value,
    editorUserId,
  );
  if (result === "NOT_FOUND") throw new CatalogError("NOT_FOUND");
  return { ok: true };
}
