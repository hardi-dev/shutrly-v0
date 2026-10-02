import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";

export function BookingFieldsCard({ service }: Readonly<ServiceDetailScreenProps>) {
  return (
    <SectionCard
      title={CATALOG_COPY.fieldsTitle}
      description={CATALOG_COPY.fieldsDescription}
      content="flush"
    >
      {service.fields.length === 0 ? (
        <p className="px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y) text-(--component-list-card-item-meta)">
          {CATALOG_COPY.fieldsEmpty}
        </p>
      ) : (
        <ul aria-label={CATALOG_COPY.fieldsTitle}>
          {service.fields.map((field, index) => (
            <ListCardItem
              key={field.id}
              icon="align-left"
              title={field.name}
              meta={CATALOG_COPY.fieldMeta(
                CATALOG_COPY.fieldTypes[field.fieldType],
                field.isRequired,
                field.options,
              )}
              isLast={index === service.fields.length - 1}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
