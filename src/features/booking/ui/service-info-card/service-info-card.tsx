import { useTranslations } from "next-intl";

import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";
import { SERVICE_INFO_CARD_COPY_NAMESPACE } from "./service-info-card.copy";

export function ServiceInfoCard({
  service,
  onEdit,
}: Readonly<ServiceDetailScreenProps & { readonly onEdit?: () => void }>) {
  const t = useTranslations(SERVICE_INFO_CARD_COPY_NAMESPACE);
  return (
    <SectionCard
      title={t("infoTitle")}
      description={t("infoDescription")}
      content="flush"
      actions={
        onEdit ? (
          <Button variant="secondary" iconLeading="pencil" onPress={onEdit}>
            {t("edit")}
          </Button>
        ) : null
      }
    >
      <dl className="flex flex-wrap gap-(--space-8) px-(--space-6) py-(--space-4)">
        <div>
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {t("category")}
          </dt>
          <dd className="font-semibold">{service.categoryName}</dd>
        </div>
        <div>
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {t("basePrice")}
          </dt>
          <dd className="font-semibold">{service.priceLabel}</dd>
        </div>
        <div>
          <dt className="text-(length:--font-size-label) text-(--component-input-helper)">
            {t("status")}
          </dt>
          <dd className="font-semibold">{service.isActive ? t("active") : t("archived")}</dd>
        </div>
      </dl>
    </SectionCard>
  );
}
