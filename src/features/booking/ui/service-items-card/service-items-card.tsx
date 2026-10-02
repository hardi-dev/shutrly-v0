import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";

export function ServiceItemsCard({ service }: Readonly<ServiceDetailScreenProps>) {
  return (
    <SectionCard
      title={CATALOG_COPY.itemsTitle}
      description={CATALOG_COPY.itemsDescription}
      content="flush"
    >
      {service.items.length === 0 ? (
        <p className="px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y) text-(--component-list-card-item-meta)">
          {CATALOG_COPY.itemsEmpty}
        </p>
      ) : (
        <ul aria-label={CATALOG_COPY.itemsTitle}>
          {service.items.map((item, index) => (
            <ListCardItem
              key={item.id}
              icon={item.selectionType ? "image" : "package"}
              title={item.definitionName}
              meta={item.unit ?? ""}
              isLast={index === service.items.length - 1}
              trailing={
                <span className="font-semibold">
                  {item.value.type === "NUMBER"
                    ? item.value.value
                    : `${item.value.min}–${item.value.max}`}
                </span>
              }
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
