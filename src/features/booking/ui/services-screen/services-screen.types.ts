import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import type { ServiceListGroup } from "@/features/booking/application/use-cases/service-results/service-results.types";
import type { ServiceWriteResult } from "@/features/booking/application/use-cases/service-results/service-results.types";

export interface ServicesScreenProps {
  readonly workspaceId: string;
  readonly groups: readonly ServiceListGroup[];
  readonly categories?: readonly CategoryRecord[];
  readonly addServiceAction?: (workspaceId: string, values: unknown) => Promise<ServiceWriteResult>;
}
