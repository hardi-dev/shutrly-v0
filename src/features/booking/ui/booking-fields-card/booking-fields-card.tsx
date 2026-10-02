import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { ServiceDetailRowActions } from "../service-detail-row-actions/service-detail-row-actions";
import type { ServiceDetailScreenProps } from "../service-detail-screen/service-detail-screen.types";
import type { BookingField, BookingFieldHandler } from "./booking-fields-card.types";

export function BookingFieldsCard({
  service,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}: Readonly<
  ServiceDetailScreenProps & {
    readonly onEdit: BookingFieldHandler;
    readonly onDelete: BookingFieldHandler;
    readonly onMoveUp: BookingFieldHandler;
    readonly onMoveDown: BookingFieldHandler;
  }
>) {
  return (
    <SectionCard
      title={CATALOG_COPY.fieldsTitle}
      description={CATALOG_COPY.fieldsDescription}
      content="flush"
    >
      {service.fields.length === 0 ? (
        <EmptyFields />
      ) : (
        <ul aria-label={CATALOG_COPY.fieldsTitle}>
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

function EmptyFields() {
  return (
    <p className="px-(--component-list-card-item-padding-x) py-(--component-list-card-item-padding-y) text-(--component-list-card-item-meta)">
      {CATALOG_COPY.fieldsEmpty}
    </p>
  );
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
  return (
    <ListCardItem
      icon="align-left"
      title={field.name}
      meta={CATALOG_COPY.fieldMeta(
        CATALOG_COPY.fieldTypes[field.fieldType],
        field.isRequired,
        field.options,
      )}
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
  const meta = CATALOG_COPY.fieldMeta(
    CATALOG_COPY.fieldTypes[field.fieldType],
    field.isRequired,
    field.options,
  );
  return (
    <ServiceDetailRowActions
      kind="field"
      name={field.name}
      meta={meta}
      canMoveUp={index > 0}
      canMoveDown={index < count - 1}
      onEdit={handleEdit}
      onMoveUp={handleMoveUp}
      onMoveDown={handleMoveDown}
      onDelete={handleDelete}
    />
  );
}
