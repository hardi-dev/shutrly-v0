import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { CatalogDeleteResult } from "@/features/booking/application/use-cases/catalog-results/catalog-results.types";
import type { ServiceListGroup } from "@/features/booking/application/use-cases/service-results/service-results.types";
import type { ServiceWriteResult } from "@/features/booking/application/use-cases/service-results/service-results.types";

export interface ServicesScreenProps {
  readonly workspaceId: string;
  readonly groups: readonly ServiceListGroup[];
  readonly categories?: readonly CategoryRecord[];
  readonly addServiceAction?: (workspaceId: string, values: unknown) => Promise<ServiceWriteResult>;
  readonly updateServiceInfoAction?: (
    workspaceId: string,
    serviceId: string,
    values: unknown,
  ) => Promise<ServiceWriteResult | undefined>;
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
