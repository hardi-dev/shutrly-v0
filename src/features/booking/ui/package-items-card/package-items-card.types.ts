import type { ServiceItemRecord } from "@/features/booking/application/ports/service-repository/service-repository.port";

export interface PackageItemsCardProps {
  readonly serviceName: string;
  readonly items: readonly ServiceItemRecord[];
  readonly isMobile: boolean;
  /** Replaces the create-form description, e.g. on the detail page. */
  readonly description?: string;
  /** Create mode: Tambah item and the item ⋯ (AC-PRJ-030); omitted for a read-only package. */
  readonly edit?: PackageCardEdit;
}

export type PackageCardItem = PackageItemsCardProps["items"][number];

export interface PackageCardEdit {
  readonly onAdd: () => void;
  readonly onEdit: (item: PackageCardItem) => void;
  readonly onRemove: (item: PackageCardItem) => void;
}
