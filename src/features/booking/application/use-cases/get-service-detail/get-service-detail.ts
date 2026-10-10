import "server-only";

import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { summariseServiceItems } from "@/features/booking/domain/item-summary/item-summary";
import type { FormattingLocale } from "@/shared/locale/locale.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { CatalogError } from "../../errors/catalog-errors/catalog-errors";
import type { ServiceRepositoryPort } from "../../ports/service-repository/service-repository.port";
import type { ServiceDetailView } from "../service-results/service-results.types";

export async function getServiceDetail(
  repository: ServiceRepositoryPort,
  context: WorkspaceContext,
  id: string,
  locale: FormattingLocale,
): Promise<ServiceDetailView> {
  const service = await repository.findDetail(context, id);
  if (!service) throw new CatalogError("NOT_FOUND");
  return {
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
  };
}
