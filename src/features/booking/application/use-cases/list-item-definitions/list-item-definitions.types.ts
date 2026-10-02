import type { ItemDefinitionRecord } from "../../ports/item-definition-repository/item-definition-repository.port";

export interface ItemDefinitionGroups {
  readonly selection: readonly ItemDefinitionRecord[];
  readonly other: readonly ItemDefinitionRecord[];
}
