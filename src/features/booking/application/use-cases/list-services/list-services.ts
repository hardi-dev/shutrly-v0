import "server-only";

import { sortCatalogEntries } from "@/features/booking/domain/catalog-order/catalog-order";
import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { summariseServiceItems } from "@/features/booking/domain/item-summary/item-summary";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { CategoryRepositoryPort } from "../../ports/category-repository/category-repository.port";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";
import { listCategories } from "../list-categories/list-categories";
import type { ServiceListGroup } from "../service-results/service-results.types";

export async function listServices(
  serviceRepository: ServiceRepositoryPort,
  categoryRepository: CategoryRepositoryPort,
  context: WorkspaceContext,
  locale: FormattingLocale,
): Promise<readonly ServiceListGroup[]> {
  const [categories, services] = await Promise.all([
    listCategories(categoryRepository, context),
    serviceRepository.listWithItems(context),
  ]);
  return categories.map((category) => ({
    categoryId: category.id,
    categoryName: category.name,
    isActive: category.isActive,
    services: sortCatalogEntries(
      services.filter((service) => service.categoryId === category.id),
    ).map((service) => ({
      ...service,
      priceLabel: formatIdr(service.basePrice, locale),
      summary: summariseServiceItems(
        service.items.map((item) => ({
          name: item.definitionName,
          unit: item.unit,
          value: item.value,
        })),
        locale,
      ),
    })),
  }));
}
