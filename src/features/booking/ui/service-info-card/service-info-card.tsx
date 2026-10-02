import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";

export function ServiceInfoCard({ service }: Readonly<ServiceDetailScreenProps>) {
  return (
    <SectionCard title={CATALOG_COPY.infoTitle} description={CATALOG_COPY.infoDescription}>
      <dl className="grid gap-(--space-3) sm:grid-cols-3">
        <div>
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {CATALOG_COPY.nameService}
          </dt>
          <dd className="font-semibold">{service.name}</dd>
        </div>
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
      </dl>
    </SectionCard>
  );
}
