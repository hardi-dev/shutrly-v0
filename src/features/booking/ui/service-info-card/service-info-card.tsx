import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";

export function ServiceInfoCard({
  service,
  onEdit,
}: Readonly<ServiceDetailScreenProps & { readonly onEdit?: () => void }>) {
  return (
    <SectionCard
      title={CATALOG_COPY.infoTitle}
      description={CATALOG_COPY.infoDescription}
      content="flush"
      actions={
        onEdit ? (
          <Button variant="secondary" iconLeading="pencil" onPress={onEdit}>
            {CATALOG_COPY.edit}
          </Button>
        ) : null
      }
    >
      <dl className="flex flex-wrap gap-(--space-8) px-(--space-6) py-(--space-4)">
        <div>
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {CATALOG_COPY.category}
          </dt>
          <dd className="font-semibold">{service.categoryName}</dd>
        </div>
        <div>
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {CATALOG_COPY.basePrice}
          </dt>
          <dd className="font-semibold">{service.priceLabel}</dd>
        </div>
        <div>
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {CATALOG_COPY.status}
          </dt>
          <dd className="font-semibold">
            {service.isActive ? CATALOG_COPY.active : CATALOG_COPY.archived}
          </dd>
        </div>
      </dl>
    </SectionCard>
  );
}
