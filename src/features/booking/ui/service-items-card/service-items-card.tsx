import { useTranslations } from "next-intl";

import { displayItemDefinition } from "@/features/booking/domain/default-item-definitions/default-item-definitions";
import type { AppLocale } from "@/shared/locale/locale.types";
import { useAppLocale } from "@/ui/hooks/use-app-locale/use-app-locale";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { ServiceDetailRowActions } from "../service-detail-row-actions/service-detail-row-actions";
import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";
import { SERVICE_ITEMS_CARD_COPY_NAMESPACE } from "./service-items-card.copy";
import type { ServiceItem, ServiceItemHandler } from "./service-items-card.types";

/** D-18: the item's name and unit as the reader sees them. */
function shownItem(item: ServiceItem, locale: AppLocale) {
  return displayItemDefinition(
    { name: item.definitionName, unit: item.unit, defaultKey: item.defaultKey },
    locale,
  );
}

export function ServiceItemsCard({
  service,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAdd,
}: Readonly<
  ServiceDetailScreenProps & {
    readonly onEdit: ServiceItemHandler;
    readonly onDelete: ServiceItemHandler;
    readonly onMoveUp: ServiceItemHandler;
    readonly onMoveDown: ServiceItemHandler;
    readonly onAdd?: () => void;
  }
>) {
  const t = useTranslations(SERVICE_ITEMS_CARD_COPY_NAMESPACE);
  return (
    <SectionCard
      title={t("itemsTitle")}
      description={t("itemsDescription")}
      content="flush"
      actions={onAdd ? <AddItemButton onAdd={onAdd} /> : null}
    >
      {service.items.length === 0 ? (
        <p className="px-(--space-6) py-(--space-5) text-(--component-list-card-item-meta)">
          {t("itemsEmpty")}
        </p>
      ) : (
        <ul aria-label={t("itemsTitle")}>
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

function AddItemButton({ onAdd }: Readonly<{ onAdd: () => void }>) {
  const t = useTranslations(SERVICE_ITEMS_CARD_COPY_NAMESPACE);
  return (
    <Button variant="secondary" iconLeading="plus" onPress={onAdd}>
      {t("addItem")}
    </Button>
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
  const shown = shownItem(item, useAppLocale());
  return (
    <ListCardItem
      icon={item.pickMode ? "images" : "package"}
      title={shown.name}
      meta={shown.unit ?? ""}
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
  const shown = shownItem(item, useAppLocale());
  const value =
    item.value.type === "NUMBER" ? item.value.value : `${item.value.min}–${item.value.max}`;
  return (
    <span className="flex items-center gap-(--space-2)">
      <span className="font-semibold">{value}</span>
      <ServiceDetailRowActions
        kind="item"
        name={shown.name}
        meta={shown.unit ?? ""}
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
