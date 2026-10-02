import type { CategoryRepositoryPort } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { ItemDefinitionRepositoryPort } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import type { ServiceRepositoryPort } from "@/features/booking/application/ports/service-repository/service-repository.port";

export interface CatalogScope {
  readonly categories: CategoryRepositoryPort;
  readonly itemDefinitions: ItemDefinitionRepositoryPort;
  readonly services: ServiceRepositoryPort;
}
