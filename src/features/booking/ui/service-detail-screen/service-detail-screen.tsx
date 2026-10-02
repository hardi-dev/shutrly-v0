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
import { ServiceItemDialog } from "../service-item-dialog/service-item-dialog";
import { ServiceItemsCard } from "../service-items-card/service-items-card";
import type { ServiceDetailScreenProps } from "./service-detail-screen.types";

function noopServiceAction(): Promise<ServiceWriteResult> {
  return Promise.resolve({ ok: true });
}

export function ServiceDetailScreen(props: Readonly<ServiceDetailScreenProps>) {
  const { service } = props;
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
        <ServiceDetailForms {...props} />
        <ServiceItemsCard service={service} />
        <BookingFieldsCard service={service} />
      </main>
    </>
  );
}

function ServiceDetailActions({
  service,
  workspaceId,
  categories = [],
  setActiveAction,
  updateServiceInfoAction,
}: Readonly<ServiceDetailScreenProps>) {
  const [pending, setPending] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  async function toggle(): Promise<void> {
    if (!workspaceId || !setActiveAction) return;
    setPending(true);
    try {
      await setActiveAction(workspaceId, "service", service.id, !service.isActive);
    } finally {
      setPending(false);
    }
  }
  function handleToggle(): void {
    void toggle();
  }
  function openEdit(): void { setIsEditOpen(true); }
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

function ServiceDetailForms({
  service,
  workspaceId,
  definitions = [],
  addItemAction,
  addFieldAction,
}: Readonly<ServiceDetailScreenProps>) {
  const [itemOpen, setItemOpen] = useState(false);
  const [fieldOpen, setFieldOpen] = useState(false);
  function openItem(): void {
    setItemOpen(true);
  }
  function openField(): void {
    setFieldOpen(true);
  }
  if (!addItemAction && !addFieldAction) return null;
  return (
    <>
      <div className="flex flex-wrap gap-(--space-3)">
        {addItemAction ? <Button onPress={openItem}>{CATALOG_COPY.addItem}</Button> : null}
        {addFieldAction ? (
          <Button variant="secondary" onPress={openField}>
            {CATALOG_COPY.addField}
          </Button>
        ) : null}
      </div>
      {addItemAction ? (
        <ServiceItemDialog
          isOpen={itemOpen}
          onOpenChange={setItemOpen}
          workspaceId={workspaceId ?? ""}
          serviceId={service.id}
          definitions={definitions}
          items={service.items}
          action={addItemAction}
        />
      ) : null}
      {addFieldAction ? (
        <BookingFieldDialog
          isOpen={fieldOpen}
          onOpenChange={setFieldOpen}
          workspaceId={workspaceId ?? ""}
          serviceId={service.id}
          action={addFieldAction}
        />
      ) : null}
    </>
  );
}
