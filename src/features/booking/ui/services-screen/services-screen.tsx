import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogTabsBar } from "../catalog-tabs-bar/catalog-tabs-bar";
import type { ServicesScreenProps } from "./services-screen.types";

// eslint-disable-next-line max-lines-per-function -- coordinates the route-level empty and populated states
export function ServicesScreen({ workspaceId, groups }: Readonly<ServicesScreenProps>) {
  const addButton = <Button iconLeading="plus">{CATALOG_COPY.addService}</Button>;
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
      <CatalogTabsBar workspaceId={workspaceId} activeTab="services" />
      <PageActions>{addButton}</PageActions>
      {groups.length === 0 ? (
        <SectionCard content="flush">
          <EmptyState
            placement="in-card"
            icon="package"
            title={CATALOG_COPY.servicesEmptyTitle}
            body={CATALOG_COPY.servicesEmptyBody}
            action={addButton}
          />
        </SectionCard>
      ) : (
        groups.map((group) => (
          <SectionCard
            key={group.categoryId}
            title={group.categoryName}
            content="flush"
            description={CATALOG_COPY.categoryMeta(group.services.length)}
          >
            <ul aria-label={group.categoryName}>
              {group.services.map((service, index) => (
                <ListCardItem
                  key={service.id}
                  href={`/w/${workspaceId}/services/${service.id}`}
                  icon="package"
                  title={service.name}
                  meta={service.summary}
                  isLast={index === group.services.length - 1}
                  trailing={
                    <span className="flex items-center gap-(--space-2)">
                      <span className="text-(length:--font-size-body) font-semibold text-(--component-list-card-item-title)">
                        {service.priceLabel}
                      </span>
                      {!service.isActive ? (
                        <StatusChip tone="neutral" label={CATALOG_COPY.archived} hasDot={false} />
                      ) : null}
                    </span>
                  }
                />
              ))}
            </ul>
          </SectionCard>
        ))
      )}
    </main>
  );
}
