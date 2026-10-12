import { useTranslations } from "next-intl";

import { ListCardItemSkeleton } from "@/ui/patterns/list-card-item/list-card-item-skeleton";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import {
  CATALOG_SKELETON_COPY_NAMESPACE,
  PROJECT_SKELETON_COPY_NAMESPACE,
} from "./catalog-skeletons.copy";
import type { CatalogSkeletonProps, CatalogSkeletonVariant } from "./catalog-skeletons.types";

const CATALOG_TITLE_KEY = {
  services: "tabServices",
  categories: "tabCategories",
  items: "tabItems",
  detail: "loadingService",
} as const;

/** The card title for a variant, in the active language (BR-L10N-002). */
function useSkeletonTitle(variant: CatalogSkeletonVariant): string {
  const catalogT = useTranslations(CATALOG_SKELETON_COPY_NAMESPACE);
  const projectT = useTranslations(PROJECT_SKELETON_COPY_NAMESPACE);
  return variant === "project" ? projectT("loadingProject") : catalogT(CATALOG_TITLE_KEY[variant]);
}

export function CatalogSkeleton({ variant }: Readonly<CatalogSkeletonProps>) {
  const title = useSkeletonTitle(variant);
  const count = variant === "detail" || variant === "project" ? 3 : 4;
  return (
    <main
      aria-busy="true"
      data-testid={`catalog-${variant}-skeleton`}
      className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)"
    >
      <SectionCard title={title} content="flush">
        <ul>
          {Array.from({ length: count }, (_, index) => (
            <ListCardItemSkeleton key={index} isLast={index === count - 1} hasTrailing />
          ))}
        </ul>
      </SectionCard>
    </main>
  );
}
