import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { ServiceDetailRowActions } from "../service-detail-row-actions/service-detail-row-actions";
import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";
import type { ServiceItem, ServiceItemHandler } from "./service-items-card.types";

export function ServiceItemsCard({
  service,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Readonly<
  ServiceDetailScreenProps & {
    readonly onEdit: ServiceItemHandler;
    readonly onDelete: ServiceItemHandler;
    readonly onMoveUp: ServiceItemHandler;
    readonly onMoveDown: ServiceItemHandler;
  }
>) {
  return (
    <SectionCard
      title={CATALOG_COPY.itemsTitle}
      description={CATALOG_COPY.itemsDescription}
      content="flush"
    >
      {service.items.length === 0 ? (
        <EmptyItems />
      ) : (
        <ul aria-label={CATALOG_COPY.itemsTitle}>
          {service.items.map((item, index) => (
            <ServiceItemRow
              key={item.id}
              item={item}
              index={index}
              count={service.items.length}
              onEdit={onEdit}
              onDelete={onDelete}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}

function EmptyItems() {
  return (
    <p className="px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y) text-(--component-list-card-item-meta)">
      {CATALOG_COPY.itemsEmpty}
    </p>
  );
}

function ServiceItemRow({
  item,
  index,
  count,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Readonly<{
  readonly item: ServiceItem;
  readonly index: number;
  readonly count: number;
  readonly onEdit: ServiceItemHandler;
  readonly onDelete: ServiceItemHandler;
  readonly onMoveUp: ServiceItemHandler;
  readonly onMoveDown: ServiceItemHandler;
}>) {
  return (
    <ListCardItem
      icon={item.selectionType ? "image" : "package"}
      title={item.definitionName}
      meta={item.unit ?? ""}
      isLast={index === count - 1}
      trailing={
        <ServiceItemTrailing
          item={item}
          index={index}
          count={count}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
        />
      }
    />
  );
}

function ServiceItemTrailing({
  item,
  index,
  count,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Readonly<{
  readonly item: ServiceItem;
  readonly index: number;
  readonly count: number;
  readonly onEdit: ServiceItemHandler;
  readonly onDelete: ServiceItemHandler;
  readonly onMoveUp: ServiceItemHandler;
  readonly onMoveDown: ServiceItemHandler;
}>) {
  function handleEdit(): void {
    onEdit(item);
  }
  function handleDelete(): void {
    onDelete(item);
  }
  function handleMoveUp(): void {
    onMoveUp(item);
  }
  function handleMoveDown(): void {
    onMoveDown(item);
  }
  const value =
    item.value.type === "NUMBER" ? item.value.value : `${item.value.min}–${item.value.max}`;
  return (
    <span className="flex items-center gap-(--space-2)">
      <span className="font-semibold">{value}</span>
      <ServiceDetailRowActions
        kind="item"
        name={item.definitionName}
        meta={item.unit ?? ""}
        canMoveUp={index > 0}
        canMoveDown={index < count - 1}
        onEdit={handleEdit}
        onMoveUp={handleMoveUp}
        onMoveDown={handleMoveDown}
        onDelete={handleDelete}
      />
    </span>
  );
}
