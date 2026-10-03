import { summariseServiceItems } from "@/features/booking/domain/item-summary/item-summary";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { PackageItemsCardProps } from "./package-items-card.types";

/** Lists the package items copied from the service; editing them arrives with F-07 Slice 7. */
export function PackageItemsCard({
  serviceName,
  items,
  isMobile,
}: Readonly<PackageItemsCardProps>) {
  return (
    <SectionCard
      title={PROJECT_COPY.packageTitle}
      description={
        isMobile
          ? PROJECT_COPY.packageDescriptionMobile(serviceName)
          : PROJECT_COPY.packageDescriptionDesktop(serviceName)
      }
      content="flush"
    >
      {items.length === 0 ? (
        <EmptyState
          icon="package"
          placement="in-card"
          title={PROJECT_COPY.packageEmptyTitle}
          body={PROJECT_COPY.packageEmptyBody}
        />
      ) : (
        <ul aria-label={PROJECT_COPY.packageTitle}>
          {items.map((item, index) => (
            <ListCardItem
              key={item.definitionId}
              icon={item.selectionType ? "image" : "package"}
              title={item.definitionName}
              meta={describeItem(item)}
              isLast={index === items.length - 1}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function describeItem(item: PackageItemsCardProps["items"][number]): string {
  const summary = summariseServiceItems([
    { name: item.definitionName, unit: item.unit, value: item.value },
  ]);
  if (item.selectionType === "EDIT") return `${summary} · ${PROJECT_COPY.selectionEdit}`;
  if (item.selectionType === "PRINT") return `${summary} · ${PROJECT_COPY.selectionPrint}`;
  return summary;
}
