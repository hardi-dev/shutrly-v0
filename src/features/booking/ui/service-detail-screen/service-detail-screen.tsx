"use client";

import { useState } from "react";

import type { ServiceWriteResult } from "@/features/booking/application/use-cases/service-results/service-results.types";
import { Alert } from "@/ui/patterns/alert/alert";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { AddServiceDialog } from "../add-service-dialog/add-service-dialog";
import { BookingFieldDialog } from "../booking-field-dialog/booking-field-dialog";
import { BookingFieldsCard } from "../booking-fields-card/booking-fields-card";
import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { ServiceInfoCard } from "../service-info-card/service-info-card";
import { ServiceDetailDeleteDialog } from "../service-detail-delete-dialog/service-detail-delete-dialog";
import { ServiceItemDialog } from "../service-item-dialog/service-item-dialog";
import { ServiceItemsCard } from "../service-items-card/service-items-card";
import type {
  ServiceDetailDialogs,
  ServiceDetailDialogState,
  ServiceDetailMutationHandlers,
  ServiceDetailScreenProps,
} from "./service-detail-screen.types";

function noopServiceAction(): Promise<ServiceWriteResult> {
  return Promise.resolve({ ok: true });
}

export function ServiceDetailScreen(props: Readonly<ServiceDetailScreenProps>) {
  const { service } = props;
  const dialogs = useServiceDetailDialogs(props);
  return (
    <>
      {props.setActiveAction ? <ServiceDetailActions {...props} /> : null}
      <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
        {!service.isActive ? (
          <Alert
            tone="warning"
            title={CATALOG_COPY.archivedBannerTitle}
            body={CATALOG_COPY.archivedBannerBody}
          />
        ) : null}
        <ServiceInfoCard service={service} />
        <ServiceDetailForms {...props} dialogs={dialogs} />
        <ServiceItemsCard
          {...props}
          service={service}
          onEdit={dialogs.openEditItem}
          onDelete={dialogs.openDeleteItem}
          onMoveUp={dialogs.moveItemUp}
          onMoveDown={dialogs.moveItemDown}
        />
        <BookingFieldsCard
          {...props}
          service={service}
          onEdit={dialogs.openEditField}
          onDelete={dialogs.openDeleteField}
          onMoveUp={dialogs.moveFieldUp}
          onMoveDown={dialogs.moveFieldDown}
        />
        <ServiceDetailDeleteDialogs props={props} dialogs={dialogs} />
      </main>
    </>
  );
}

function useServiceDetailDialogs(props: Readonly<ServiceDetailScreenProps>): ServiceDetailDialogs {
  return { ...useServiceDetailDialogState(), ...useServiceMutationHandlers(props) };
}

function useServiceDetailDialogState(): ServiceDetailDialogState {
  const [itemOpen, setItemOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);
  const [editingItem, setEditingItem] =
    useState<ServiceDetailScreenProps["service"]["items"][number]>();
  const [editingField, setEditingField] =
    useState<ServiceDetailScreenProps["service"]["fields"][number]>();
  const deleteState = useServiceDetailDeleteState();
  function openAddItem(): void {
    setEditingItem(undefined);
    setItemOpen(true);
  }
  function openEditItem(item: ServiceDetailScreenProps["service"]["items"][number]): void {
    setEditingItem(item);
    setItemOpen(true);
  }
  function openAddField(): void {
    setEditingField(undefined);
    setFieldOpen(true);
  }
  function openEditField(field: ServiceDetailScreenProps["service"]["fields"][number]): void {
    setEditingField(field);
    setFieldOpen(true);
  }
  return {
    itemOpen,
    fieldOpen,
    editingItem,
    editingField,
    ...deleteState,
    openAddItem,
    openEditItem,
    openAddField,
    openEditField,
    setItemOpen,
    setFieldOpen,
  };
}

function useServiceDetailDeleteState() {
  const [deletingItem, setDeletingItem] =
    useState<ServiceDetailScreenProps["service"]["items"][number]>();
  const [deletingField, setDeletingField] =
    useState<ServiceDetailScreenProps["service"]["fields"][number]>();
  function openDeleteItem(item: ServiceDetailScreenProps["service"]["items"][number]): void {
    setDeletingField(undefined);
    setDeletingItem(item);
  }
  function openDeleteField(field: ServiceDetailScreenProps["service"]["fields"][number]): void {
    setDeletingItem(undefined);
    setDeletingField(field);
  }
  function closeDelete(): void {
    setDeletingItem(undefined);
    setDeletingField(undefined);
  }
  return { deletingItem, deletingField, openDeleteItem, openDeleteField, closeDelete };
}

function useServiceMutationHandlers(
  props: Readonly<ServiceDetailScreenProps>,
): ServiceDetailMutationHandlers {
  function moveItemUp(item: ServiceDetailScreenProps["service"]["items"][number]): void {
    if (props.workspaceId && props.moveItemAction)
      void props.moveItemAction(props.workspaceId, props.service.id, item.id, "UP");
  }
  function moveItemDown(item: ServiceDetailScreenProps["service"]["items"][number]): void {
    if (props.workspaceId && props.moveItemAction)
      void props.moveItemAction(props.workspaceId, props.service.id, item.id, "DOWN");
  }
  function moveFieldUp(field: ServiceDetailScreenProps["service"]["fields"][number]): void {
    if (props.workspaceId && props.moveFieldAction)
      void props.moveFieldAction(props.workspaceId, props.service.id, field.id, "UP");
  }
  function moveFieldDown(field: ServiceDetailScreenProps["service"]["fields"][number]): void {
    if (props.workspaceId && props.moveFieldAction)
      void props.moveFieldAction(props.workspaceId, props.service.id, field.id, "DOWN");
  }
  return { moveItemUp, moveItemDown, moveFieldUp, moveFieldDown };
}

function ServiceDetailActions({
  service,
  workspaceId,
  categories = [],
  setActiveAction,
  updateServiceInfoAction,
}: Readonly<ServiceDetailScreenProps>) {
  const { pending, toggle } = useServiceActiveToggle({
    workspaceId,
    serviceId: service.id,
    isActive: service.isActive,
    setActiveAction,
  });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const handleToggle = (): void => {
    void toggle();
  };
  const openEdit = (): void => {
    setIsEditOpen(true);
  };
  return (
    <PageActions>
      {updateServiceInfoAction && workspaceId ? (
        <Button variant="secondary" onPress={openEdit}>
          {CATALOG_COPY.edit}
        </Button>
      ) : null}
      <Button
        variant={service.isActive ? "secondary" : "primary"}
        onPress={handleToggle}
        isPending={pending}
      >
        {service.isActive ? CATALOG_COPY.archive : CATALOG_COPY.unarchive}
      </Button>
      {updateServiceInfoAction && workspaceId ? (
        <AddServiceDialog
          isOpen={isEditOpen}
          onOpenChange={setIsEditOpen}
          workspaceId={workspaceId}
          categories={categories}
          service={service}
          action={noopServiceAction}
          updateAction={updateServiceInfoAction}
        />
      ) : null}
    </PageActions>
  );
}

function useServiceActiveToggle({
  workspaceId,
  serviceId,
  isActive,
  setActiveAction,
}: Readonly<{
  readonly workspaceId?: string;
  readonly serviceId: string;
  readonly isActive: boolean;
  readonly setActiveAction: ServiceDetailScreenProps["setActiveAction"];
}>) {
  const [pending, setPending] = useState(false);
  async function toggle(): Promise<void> {
    if (!workspaceId || !setActiveAction) return;
    setPending(true);
    try {
      await setActiveAction(workspaceId, "service", serviceId, !isActive);
    } finally {
      setPending(false);
    }
  }
  return { pending, toggle };
}

function ServiceDetailForms({
  service,
  workspaceId,
  definitions = [],
  addItemAction,
  updateItemAction,
  addFieldAction,
  updateFieldAction,
  dialogs,
}: Readonly<ServiceDetailScreenProps & { readonly dialogs: ServiceDetailDialogs }>) {
  if (!addItemAction && !addFieldAction) return null;
  return (
    <>
      <div className="flex flex-wrap gap-(--space-3)">
        {addItemAction ? (
          <Button onPress={dialogs.openAddItem}>{CATALOG_COPY.addItem}</Button>
        ) : null}
        {addFieldAction ? (
          <Button variant="secondary" onPress={dialogs.openAddField}>
            {CATALOG_COPY.addField}
          </Button>
        ) : null}
      </div>
      <ServiceDetailFormDialogs
        service={service}
        workspaceId={workspaceId}
        definitions={definitions}
        addItemAction={addItemAction}
        updateItemAction={updateItemAction}
        addFieldAction={addFieldAction}
        updateFieldAction={updateFieldAction}
        dialogs={dialogs}
      />
    </>
  );
}

function ServiceDetailFormDialogs({
  service,
  workspaceId,
  definitions = [],
  addItemAction,
  updateItemAction,
  addFieldAction,
  updateFieldAction,
  dialogs,
}: Readonly<ServiceDetailScreenProps & { readonly dialogs: ServiceDetailDialogs }>) {
  return (
    <>
      {addItemAction ? (
        <ServiceItemDialog
          key={dialogs.editingItem?.id ?? "new-item"}
          isOpen={dialogs.itemOpen}
          onOpenChange={dialogs.setItemOpen}
          workspaceId={workspaceId ?? ""}
          serviceId={service.id}
          definitions={definitions}
          items={service.items}
          item={dialogs.editingItem}
          action={addItemAction}
          updateAction={updateItemAction}
        />
      ) : null}
      {addFieldAction ? (
        <BookingFieldDialog
          key={dialogs.editingField?.id ?? "new-field"}
          isOpen={dialogs.fieldOpen}
          onOpenChange={dialogs.setFieldOpen}
          workspaceId={workspaceId ?? ""}
          serviceId={service.id}
          field={dialogs.editingField}
          action={addFieldAction}
          updateAction={updateFieldAction}
        />
      ) : null}
    </>
  );
}

function ServiceDetailDeleteDialogs({
  props,
  dialogs,
}: Readonly<{ readonly props: ServiceDetailScreenProps; readonly dialogs: ServiceDetailDialogs }>) {
  async function confirmItem(): Promise<void> {
    if (props.workspaceId && props.removeItemAction && dialogs.deletingItem) {
      await props.removeItemAction(props.workspaceId, props.service.id, dialogs.deletingItem.id);
    }
    dialogs.closeDelete();
  }
  async function confirmField(): Promise<void> {
    if (props.workspaceId && props.removeFieldAction && dialogs.deletingField) {
      await props.removeFieldAction(props.workspaceId, props.service.id, dialogs.deletingField.id);
    }
    dialogs.closeDelete();
  }
  function close(open: boolean): void {
    if (!open) dialogs.closeDelete();
  }
  return (
    <>
      {dialogs.deletingItem ? (
        <ServiceDetailDeleteDialog
          isOpen
          title={CATALOG_COPY.removeItemTitle(dialogs.deletingItem.definitionName)}
          description={CATALOG_COPY.removeDescription}
          onOpenChange={close}
          onConfirm={confirmItem}
        />
      ) : null}
      {dialogs.deletingField ? (
        <ServiceDetailDeleteDialog
          isOpen
          title={CATALOG_COPY.removeFieldTitle(dialogs.deletingField.name)}
          description={CATALOG_COPY.removeDescription}
          onOpenChange={close}
          onConfirm={confirmField}
        />
      ) : null}
    </>
  );
}
