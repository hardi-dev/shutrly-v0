import { useTranslations } from "next-intl";

import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { CATALOG_FIELD_TYPE_MESSAGE_KEY } from "../catalog-copy/catalog-copy.copy";
import type { CatalogTranslate } from "../catalog-copy/catalog-copy.types";
import { ServiceDetailRowActions } from "../service-detail-row-actions/service-detail-row-actions";
import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";
import { BOOKING_FIELDS_CARD_COPY_NAMESPACE } from "./booking-fields-card.copy";
import type { BookingField, BookingFieldHandler } from "./booking-fields-card.types";

export function BookingFieldsCard({
  service,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAdd,
}: Readonly<
  ServiceDetailScreenProps & {
    readonly onEdit: BookingFieldHandler;
    readonly onDelete: BookingFieldHandler;
    readonly onMoveUp: BookingFieldHandler;
    readonly onMoveDown: BookingFieldHandler;
    readonly onAdd?: () => void;
  }
>) {
  const t = useTranslations(BOOKING_FIELDS_CARD_COPY_NAMESPACE);
  return (
    <SectionCard
      title={t("fieldsTitle")}
      description={t("fieldsDescription")}
      content="flush"
      actions={onAdd ? <AddFieldButton onAdd={onAdd} /> : null}
    >
      {service.fields.length === 0 ? (
        <p className="px-(--space-6) py-(--space-5) text-(--component-list-card-item-meta)">
          {t("fieldsEmpty")}
        </p>
      ) : (
        <ul aria-label={t("fieldsTitle")}>
          {service.fields.map((field, index) => (
            <BookingFieldRow
              key={field.id}
              field={field}
              index={index}
              count={service.fields.length}
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

function AddFieldButton({ onAdd }: Readonly<{ onAdd: () => void }>) {
  const t = useTranslations(BOOKING_FIELDS_CARD_COPY_NAMESPACE);
  return (
    <Button variant="secondary" iconLeading="plus" onPress={onAdd}>
      {t("addField")}
    </Button>
  );
}

/**
 * The metadata line of a booking field, e.g. "Text · Required" or "Choice: Campus A · Required".
 * @param t - the catalog translator
 * @param field - the booking field
 * @returns the translated line
 */
export function bookingFieldMeta(t: CatalogTranslate, field: BookingField): string {
  const type = t(CATALOG_FIELD_TYPE_MESSAGE_KEY[field.fieldType]);
  if (field.options) {
    const key = field.isRequired ? "fieldMetaChoicesRequired" : "fieldMetaChoicesOptional";
    return t(key, { type, options: field.options.join(", ") });
  }
  const key = field.isRequired ? "fieldMetaRequired" : "fieldMetaOptional";
  return t(key, { type });
}

function BookingFieldRow({
  field,
  index,
  count,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Readonly<{
  readonly field: BookingField;
  readonly index: number;
  readonly count: number;
  readonly onEdit: BookingFieldHandler;
  readonly onDelete: BookingFieldHandler;
  readonly onMoveUp: BookingFieldHandler;
  readonly onMoveDown: BookingFieldHandler;
}>) {
  const t = useTranslations(BOOKING_FIELDS_CARD_COPY_NAMESPACE);
  return (
    <ListCardItem
      icon="align-left"
      title={field.name}
      meta={bookingFieldMeta(t, field)}
      isLast={index === count - 1}
      trailing={
        <BookingFieldTrailing
          field={field}
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

function BookingFieldTrailing({
  field,
  index,
  count,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Readonly<{
  readonly field: BookingField;
  readonly index: number;
  readonly count: number;
  readonly onEdit: BookingFieldHandler;
  readonly onDelete: BookingFieldHandler;
  readonly onMoveUp: BookingFieldHandler;
  readonly onMoveDown: BookingFieldHandler;
}>) {
  const t = useTranslations(BOOKING_FIELDS_CARD_COPY_NAMESPACE);
  function handleEdit(): void {
    onEdit(field);
  }
  function handleDelete(): void {
    onDelete(field);
  }
  function handleMoveUp(): void {
    onMoveUp(field);
  }
  function handleMoveDown(): void {
    onMoveDown(field);
  }
  return (
    <ServiceDetailRowActions
      kind="field"
      name={field.name}
      meta={bookingFieldMeta(t, field)}
      canMoveUp={index > 0}
      canMoveDown={index < count - 1}
      onEdit={handleEdit}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onDelete={handleDelete}
    />
  );
}
