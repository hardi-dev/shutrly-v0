import "server-only";

import {
  DEFAULT_ITEM_COPY,
  DEFAULT_ITEM_DEFINITIONS,
} from "@/features/booking/domain/default-item-definitions/default-item-definitions";
import type { AppLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ItemDefinitionRepositoryPort } from "../../ports/item-definition-repository/item-definition-repository.port";

export async function seedDefaultItemDefinitions(
  repository: ItemDefinitionRepositoryPort,
  context: WorkspaceContext,
  locale: AppLocale,
): Promise<void> {
  await repository.seedDefaults(
    context,
    DEFAULT_ITEM_DEFINITIONS.map((definition) => ({
      ...definition,
      ...DEFAULT_ITEM_COPY[locale][definition.defaultKey],
      editorUserId: null,
    })),
  );
}
