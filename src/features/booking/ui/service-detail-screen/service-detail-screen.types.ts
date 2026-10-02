import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type { CatalogDeleteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type { CatalogWriteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type {
  ServiceDetailView,
  ServiceWriteResult,
} from "@/features/booking/application/use-cases/service-results/service-results.types";

export interface ServiceDetailScreenProps {
  readonly service: ServiceDetailView;
  readonly workspaceId?: string;
  readonly setActiveAction?: (
    workspaceId: string,
    kind: "service",
    id: string,
    isActive: boolean,
  ) => Promise<void>;
  readonly removeAction?: (
    workspaceId: string,
    kind: "service",
    id: string,
  ) => Promise<CatalogDeleteResult>;
  readonly definitions?: readonly ItemDefinitionRecord[];
  readonly categories?: readonly CategoryRecord[];
  readonly updateServiceInfoAction?: (
    workspaceId: string,
    serviceId: string,
    values: unknown,
  ) => Promise<ServiceWriteResult | undefined>;
  readonly addItemAction?: (
    workspaceId: string,
    serviceId: string,
    values: { readonly definitionId: string; readonly value: unknown },
  ) => Promise<CatalogWriteResult | undefined>;
  readonly addFieldAction?: (
    workspaceId: string,
    serviceId: string,
    values: unknown,
  ) => Promise<CatalogWriteResult | undefined>;
}
