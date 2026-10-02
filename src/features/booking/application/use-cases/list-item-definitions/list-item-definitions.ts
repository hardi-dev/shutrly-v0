import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  ItemDefinitionRecord,
  ItemDefinitionRepositoryPort,
} from "../../ports/item-definition-repository/item-definition-repository.port";
import type { ItemDefinitionGroups } from "./list-item-definitions.types";

export async function listItemDefinitions(
  repository: ItemDefinitionRepositoryPort,
  context: WorkspaceContext,
): Promise<ItemDefinitionGroups> {
  const definitions = await repository.list(context);
  const sort = (items: readonly ItemDefinitionRecord[]) =>
    [...items].sort((a, b) => a.name.localeCompare(b.name, "id", { sensitivity: "base" }));
  return {
    selection: sort(definitions.filter((definition) => definition.selectionRequired)),
    other: sort(definitions.filter((definition) => !definition.selectionRequired)),
  };
}
