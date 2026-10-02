import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { ServiceDetailScreenProps } from "./service-detail-screen.types";

export function ServiceDetailScreen({ service }: Readonly<ServiceDetailScreenProps>) {
  return (
    <>
      <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
        <SectionCard title={CATALOG_COPY.itemsTitle} content="flush">
          <ul>
            {service.items.map((item, index) => (
              <li
                key={item.id}
                className="px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y)"
              >
                {item.definitionName}
                {CATALOG_COPY.itemValueSeparator}
                {formatItemValue(item.value)}
                {index === service.items.length - 1 ? null : <span aria-hidden="true" />}
              </li>
            ))}
          </ul>
        </SectionCard>
        <SectionCard title={CATALOG_COPY.fieldsTitle} content="flush">
          <ul>
            {service.fields.map((field) => (
              <li
                key={field.id}
                className="px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y)"
              >
                {field.name}
              </li>
            ))}
          </ul>
        </SectionCard>
      </main>
    </>
  );
}

function formatItemValue(
  value: ServiceDetailScreenProps["service"]["items"][number]["value"],
): string {
  return value.type === "NUMBER" ? value.value : `${value.min}-${value.max}`;
}
