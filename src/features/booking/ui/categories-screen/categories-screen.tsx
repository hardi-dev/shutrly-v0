import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogTabsBar } from "../catalog-tabs-bar/catalog-tabs-bar";
import type { CategoriesScreenProps } from "./categories-screen.types";

export function CategoriesScreen({ workspaceId, categories }: Readonly<CategoriesScreenProps>) {
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
      <CatalogTabsBar workspaceId={workspaceId} activeTab="categories" />
      <PageActions>
        <Button iconLeading="plus">{CATALOG_COPY.addCategory}</Button>
      </PageActions>
      <SectionCard
        title={CATALOG_COPY.categoriesTitle}
        description={CATALOG_COPY.categoriesDescription}
        content="flush"
      >
        <ul aria-label={CATALOG_COPY.categoriesTitle}>
          {categories.map((category, index) => (
            <ListCardItem
              key={category.id}
              icon="folder"
              title={category.name}
              meta={CATALOG_COPY.categoryMeta(category.serviceCount)}
              isLast={index === categories.length - 1}
              trailing={
                !category.isActive ? (
                  <StatusChip tone="neutral" label={CATALOG_COPY.archived} hasDot={false} />
                ) : undefined
              }
            />
          ))}
        </ul>
      </SectionCard>
    </main>
  );
}
