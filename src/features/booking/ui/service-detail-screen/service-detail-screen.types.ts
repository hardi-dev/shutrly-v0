import type { CatalogDeleteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type { ServiceDetailView } from "@/features/booking/application/use-cases/service-results/service-results.types";

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
}
