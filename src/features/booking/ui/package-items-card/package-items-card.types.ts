import type { ServiceItemRecord } from "@/features/booking/application/ports/service-repository/service-repository.port";

export interface PackageItemsCardProps {
  readonly serviceName: string;
  readonly items: readonly ServiceItemRecord[];
  readonly isMobile: boolean;
}
