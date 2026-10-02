"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { ServiceListItem } from "@/features/booking/application/use-cases/service-results/service-results.types";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { AddServiceDialog } from "../add-service-dialog/add-service-dialog";
import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogRowActions } from "../catalog-row-actions/catalog-row-actions";
import { CatalogTabsBar } from "../catalog-tabs-bar/catalog-tabs-bar";
import { DeleteCatalogDialog } from "../delete-catalog-dialog/delete-catalog-dialog";
import type { ServicesScreenProps } from "./services-screen.types";

export function ServicesScreen(props: Readonly<ServicesScreenProps>) {
  const dialogs = useServiceDialogs();
  const { workspaceId, groups, categories = [], addServiceAction } = props;
  const addButton = (
    <Button iconLeading="plus" onPress={dialogs.openAdd}>
      {CATALOG_COPY.addService}
    </Button>
  );
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
      <CatalogTabsBar workspaceId={workspaceId} activeTab="services" />
      <PageActions>{addButton}</PageActions>
      <ServiceGroups
        groups={groups}
        workspaceId={workspaceId}
        addButton={addButton}
        setActiveAction={props.setActiveAction}
        onEdit={dialogs.openEdit}
        onDelete={dialogs.openDelete}
      />
      <ServiceDialogs
        workspaceId={workspaceId}
        categories={categories}
        addServiceAction={addServiceAction}
        updateAction={props.updateServiceInfoAction}
        dialogs={dialogs}
        setActiveAction={props.setActiveAction}
        removeAction={props.removeAction}
      />
    </main>
  );
}

function ServiceGroups({
  groups,
  workspaceId,
  addButton,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly groups: ServicesScreenProps["groups"];
  readonly workspaceId: string;
  readonly addButton: ReactNode;
  readonly setActiveAction: ServicesScreenProps["setActiveAction"];
  readonly onEdit: (service: ServiceListItem) => void;
  readonly onDelete: (service: ServiceListItem) => void;
}>) {
  if (groups.length === 0) {
    return (
      <SectionCard content="flush">
        <EmptyState
          placement="in-card"
          icon="package"
          title={CATALOG_COPY.servicesEmptyTitle}
          body={CATALOG_COPY.servicesEmptyBody}
          action={addButton}
        />
      </SectionCard>
    );
  }
  return (
    <>
      {groups.map((group) => (
        <ServiceGroupCard
          key={group.categoryId}
          workspaceId={workspaceId}
          group={group}
          setActiveAction={setActiveAction}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </>
  );
}

function ServiceDialogs({
  workspaceId,
  categories,
  addServiceAction,
  updateAction,
  dialogs,
  setActiveAction,
  removeAction,
}: Readonly<{
  readonly workspaceId: string;
  readonly categories: ServicesScreenProps["categories"];
  readonly addServiceAction: ServicesScreenProps["addServiceAction"];
  readonly updateAction: ServicesScreenProps["updateServiceInfoAction"];
  readonly dialogs: ReturnType<typeof useServiceDialogs>;
  readonly setActiveAction: ServicesScreenProps["setActiveAction"];
  readonly removeAction: ServicesScreenProps["removeAction"];
}>) {
  if (!categories) return null;
  return (
    <>
      {addServiceAction && (updateAction || !dialogs.editing) ? (
        <AddServiceDialog
          isOpen={dialogs.isDialogOpen}
          onOpenChange={dialogs.setIsDialogOpen}
          workspaceId={workspaceId}
          categories={categories}
          service={dialogs.editing}
          action={addServiceAction}
          updateAction={updateAction}
        />
      ) : null}
      {dialogs.deleting && setActiveAction && removeAction ? (
        <DeleteCatalogDialog
          isOpen
          workspaceId={workspaceId}
          kind="service"
          entry={dialogs.deleting}
          isInUse={dialogs.deleting.items.length > 0}
          usage={CATALOG_COPY.serviceUsage(dialogs.deleting.items.length)}
          onOpenChange={dialogs.closeDelete}
          removeAction={removeAction}
          setActiveAction={setActiveAction}
        />
      ) : null}
    </>
  );
}

function useServiceDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ServiceListItem | undefined>();
  const [deleting, setDeleting] = useState<ServiceListItem | undefined>();
  function openAdd(): void {
    setEditing(undefined);
    setIsDialogOpen(true);
  }
  function openEdit(service: ServiceListItem): void {
    setEditing(service);
    setIsDialogOpen(true);
  }
  function openDelete(service: ServiceListItem): void {
    setDeleting(service);
  }
  function closeDelete(open: boolean): void {
    if (!open) setDeleting(undefined);
  }
  return {
    isDialogOpen,
    setIsDialogOpen,
    editing,
    deleting,
    openAdd,
    openEdit,
    openDelete,
    closeDelete,
  };
}

function ServiceGroupCard({
  workspaceId,
  group,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly workspaceId: string;
  readonly group: ServicesScreenProps["groups"][number];
  readonly setActiveAction: ServicesScreenProps["setActiveAction"];
  readonly onEdit: (service: ServiceListItem) => void;
  readonly onDelete: (service: ServiceListItem) => void;
}>) {
  return (
    <SectionCard
      title={group.categoryName}
      content="flush"
      description={CATALOG_COPY.categoryMeta(group.services.length)}
    >
      <ul aria-label={group.categoryName}>
        {group.services.map((service, index) => (
          <ServiceRow
            key={service.id}
            workspaceId={workspaceId}
            service={service}
            isLast={index === group.services.length - 1}
            setActiveAction={setActiveAction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </SectionCard>
  );
}

function ServiceRow({
  workspaceId,
  service,
  isLast,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly workspaceId: string;
  readonly service: ServiceListItem;
  readonly isLast: boolean;
  readonly setActiveAction: ServicesScreenProps["setActiveAction"];
  readonly onEdit: (service: ServiceListItem) => void;
  readonly onDelete: (service: ServiceListItem) => void;
}>) {
  function handleEdit(): void {
    onEdit(service);
  }
  function handleDelete(): void {
    onDelete(service);
  }
  return (
    <ListCardItem
      href={`/w/${workspaceId}/services/${service.id}`}
      icon="package"
      title={service.name}
      meta={service.summary}
      isLast={isLast}
      trailing={
        <ServiceRowTrailing
          workspaceId={workspaceId}
          service={service}
          setActiveAction={setActiveAction}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      }
    />
  );
}

function ServiceRowTrailing({
  workspaceId,
  service,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly workspaceId: string;
  readonly service: ServiceListItem;
  readonly setActiveAction: ServicesScreenProps["setActiveAction"];
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}>) {
  return (
    <span className="flex items-center gap-(--space-2)">
      <span className="text-(length:--font-size-body) font-semibold text-(--component-list-card-item-title)">
        {service.priceLabel}
      </span>
      {!service.isActive ? (
        <StatusChip tone="neutral" label={CATALOG_COPY.archived} hasDot={false} />
      ) : null}
      {setActiveAction ? (
        <CatalogRowActions
          workspaceId={workspaceId}
          kind="service"
          id={service.id}
          name={service.name}
          isActive={service.isActive}
          meta={service.summary}
          onEdit={onEdit}
          onDelete={onDelete}
          setActiveAction={setActiveAction}
        />
      ) : null}
    </span>
  );
}
