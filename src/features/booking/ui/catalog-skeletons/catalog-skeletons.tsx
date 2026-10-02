import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import type { CatalogSkeletonProps } from "./catalog-skeletons.types";

const TITLES = {
  services: "Layanan",
  categories: "Kategori",
  items: "Item paket",
  detail: "Memuat layanan",
} as const;

export function CatalogSkeleton({ variant }: Readonly<CatalogSkeletonProps>) {
  const count = variant === "detail" ? 3 : 4;
  return (
    <main
      aria-busy="true"
      data-testid={`catalog-${variant}-skeleton`}
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)"
    >
      <SectionCard title={TITLES[variant]} content="flush">
        <ul>
          {Array.from({ length: count }, (_, index) => (
            <ListCardItemSkeleton key={index} isLast={index === count - 1} hasTrailing />
          ))}
        </ul>
      </SectionCard>
    </main>
  );
}
