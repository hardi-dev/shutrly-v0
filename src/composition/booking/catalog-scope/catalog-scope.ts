import "server-only";

import { createDrizzleCategoryRepository } from "@/adapters/db/catalog-repository/drizzle-category-repository";
import { createDrizzleItemDefinitionRepository } from "@/adapters/db/catalog-repository/drizzle-item-definition-repository";
import { createDrizzleServiceRepository } from "@/adapters/db/catalog-repository/drizzle-service-repository";

import { withRequestDb } from "../../request-db/request-db";
import type { CatalogScope } from "./catalog-scope.types";

export function withCatalogScope<T>(work: (scope: CatalogScope) => Promise<T>): Promise<T> {
  return withRequestDb((db) =>
    work({
      categories: createDrizzleCategoryRepository(db),
      itemDefinitions: createDrizzleItemDefinitionRepository(db),
      services: createDrizzleServiceRepository(db),
    }),
  );
}
