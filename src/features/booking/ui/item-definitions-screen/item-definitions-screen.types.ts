import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type { CatalogDeleteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type { ItemDefinitionGroups } from "@/features/booking/application/use-cases/list-item-definitions/list-item-definitions.types";

export interface ItemDefinitionsScreenProps {
  readonly workspaceId: string;
  readonly definitions: ItemDefinitionGroups;
  readonly addAction?: (
    workspaceId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly updateAction?: (
    workspaceId: string,
    id: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
  readonly setActiveAction?: (
    workspaceId: string,
    kind: "category" | "service" | "definition",
    id: string,
    isActive: boolean,
  ) => Promise<void>;
  readonly removeAction?: (
    workspaceId: string,
    kind: "category" | "service" | "definition",
    id: string,
  ) => Promise<CatalogDeleteResult>;
}
