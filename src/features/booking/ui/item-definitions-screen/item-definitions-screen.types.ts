import type { ItemDefinitionGroups } from "@/features/booking/application/use-cases/list-item-definitions/list-item-definitions.types";

export interface ItemDefinitionsScreenProps {
  readonly workspaceId: string;
  readonly definitions: ItemDefinitionGroups;
}
