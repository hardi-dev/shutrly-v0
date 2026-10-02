import type { ServiceListGroup } from "@/features/booking/application/use-cases/service-results/service-results.types";

export interface ServicesScreenProps {
  readonly workspaceId: string;
  readonly groups: readonly ServiceListGroup[];
}
