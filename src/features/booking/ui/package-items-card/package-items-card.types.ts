import type { ServiceItemRecord } from "@/features/booking/application/ports/service-repository/service-repository.port";

export interface PackageItemsCardProps {
  readonly serviceName: string;
  readonly items: readonly ServiceItemRecord[];
  readonly isMobile: boolean;
  /** Replaces the create-form description, e.g. on the detail page. */
  readonly description?: string;
}
