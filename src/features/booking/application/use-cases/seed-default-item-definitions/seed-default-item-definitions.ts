import "server-only";

import { DEFAULT_ITEM_DEFINITIONS } from "@/features/booking/domain/default-item-definitions/default-item-definitions";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { ItemDefinitionRepositoryPort } from "../../ports/item-definition-repository/item-definition-repository.port";

export async function seedDefaultItemDefinitions(
  repository: ItemDefinitionRepositoryPort,
  context: WorkspaceContext,
): Promise<void> {
  await repository.seedDefaults(
    context,
    DEFAULT_ITEM_DEFINITIONS.map((definition) => ({ ...definition, editorUserId: null })),
  );
}
