"use client";

import { useTranslations } from "next-intl";
import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";

import type { ServiceListItem } from "@/features/booking/application/use-cases/service-results/service-results.types";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { AddServiceDialog } from "../add-service-dialog/add-service-dialog";
import type { CatalogTranslate } from "../catalog-copy/catalog-copy.types";
import { CatalogRowActions } from "../catalog-row-actions/catalog-row-actions";
import { CatalogTabsBar } from "../catalog-tabs-bar/catalog-tabs-bar";
import { DeleteCatalogDialog } from "../delete-catalog-dialog/delete-catalog-dialog";
import { SERVICES_SCREEN_COPY_NAMESPACE } from "./services-screen.copy";
import type { ServicesScreenProps } from "./services-screen.types";

export function ServicesScreen(props: Readonly<ServicesScreenProps>) {
  const dialogs = useServiceDialogs();
  const t = useTranslations(SERVICES_SCREEN_COPY_NAMESPACE);
  const { workspaceId, groups, categories = [], addServiceAction } = props;
  const addButton = (
    <Button iconLeading="plus" onPress={dialogs.openAdd}>
      {t("addService")}
    </Button>
  );
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)">
      <CatalogTabsBar workspaceId={workspaceId} activeTab="services" action={addButton} />
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
        addCategoryAction={props.addCategoryAction}
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
  const t = useTranslations(SERVICES_SCREEN_COPY_NAMESPACE);
  if (groups.length === 0) {
    return (
      <SectionCard content="flush">
        <EmptyState
          placement="in-card"
          icon="package"
          title={t("servicesEmptyTitle")}
          body={t("servicesEmptyBody")}
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
          addButton={addButton}
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
  addCategoryAction,
  updateAction,
  dialogs,
  setActiveAction,
  removeAction,
}: Readonly<{
  readonly workspaceId: string;
  readonly categories: ServicesScreenProps["categories"];
  readonly addServiceAction: ServicesScreenProps["addServiceAction"];
  readonly addCategoryAction: ServicesScreenProps["addCategoryAction"];
  readonly updateAction: ServicesScreenProps["updateServiceInfoAction"];
  readonly dialogs: ReturnType<typeof useServiceDialogs>;
  readonly setActiveAction: ServicesScreenProps["setActiveAction"];
  readonly removeAction: ServicesScreenProps["removeAction"];
}>) {
  const t = useTranslations(SERVICES_SCREEN_COPY_NAMESPACE);
  return categories ? (
    <>
      {addServiceAction && (updateAction || !dialogs.editing) ? (
        <ServiceDialog
          key={dialogs.editing?.id ?? "new-service"}
          isOpen={dialogs.isDialogOpen}
          onOpenChange={dialogs.setIsDialogOpen}
          workspaceId={workspaceId}
          categories={categories}
          service={dialogs.editing}
          action={addServiceAction}
          updateAction={updateAction}
          addCategoryAction={addCategoryAction}
        />
      ) : null}
      {dialogs.deleting && setActiveAction && removeAction ? (
        <ServiceDeleteDialog
          {...deleteDialogProps(dialogs.deleting, dialogs.closeDelete, workspaceId)}
          usage={t("serviceUsage", { count: dialogs.deleting.items.length })}
          removeAction={removeAction}
          setActiveAction={setActiveAction}
        />
      ) : null}
    </>
  ) : null;
}

/** The fixed delete-dialog props for a service row. */
function deleteDialogProps(
  entry: NonNullable<ReturnType<typeof useServiceDialogs>["deleting"]>,
  onOpenChange: ReturnType<typeof useServiceDialogs>["closeDelete"],
  workspaceId: string,
) {
  return {
    isOpen: true,
    workspaceId,
    kind: "service" as const,
    entry,
    isInUse: entry.items.length > 0,
    onOpenChange,
  };
}

function ServiceDialog(props: ComponentProps<typeof AddServiceDialog>) {
  return <AddServiceDialog {...props} />;
}

function ServiceDeleteDialog(props: ComponentProps<typeof DeleteCatalogDialog>) {
  return <DeleteCatalogDialog {...props} />;
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
  addButton,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly workspaceId: string;
  readonly group: ServicesScreenProps["groups"][number];
  readonly addButton: ReactNode;
  readonly setActiveAction: ServicesScreenProps["setActiveAction"];
  readonly onEdit: (service: ServiceListItem) => void;
  readonly onDelete: (service: ServiceListItem) => void;
}>) {
  const t = useTranslations(SERVICES_SCREEN_COPY_NAMESPACE);
  if (group.services.length === 0) {
    return (
      <EmptyServiceGroup
        categoryName={group.categoryName}
        isActive={group.isActive}
        addButton={addButton}
      />
    );
  }

  return (
    <SectionCard
      title={group.categoryName}
      content="flush"
      description={t("categoryMeta", { count: group.services.length })}
      actions={categoryStatusChip(group.isActive, t)}
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

function EmptyServiceGroup({
  categoryName,
  isActive,
  addButton,
}: Readonly<{
  readonly categoryName: string;
  readonly isActive: boolean;
  readonly addButton: ReactNode;
}>) {
  const t = useTranslations(SERVICES_SCREEN_COPY_NAMESPACE);
  return (
    <SectionCard
      title={categoryName}
      content="flush"
      description={t("categoryMeta", { count: 0 })}
      actions={categoryStatusChip(isActive, t)}
    >
      <EmptyState
        placement="in-card"
        icon="package"
        title={t("servicesEmptyTitle")}
        body={t("categoryServicesEmptyBody")}
        action={addButton}
      />
    </SectionCard>
  );
}

function categoryStatusChip(isActive: boolean, t: CatalogTranslate): ReactNode {
  return isActive ? null : <StatusChip tone="neutral" label={t("archived")} hasDot={false} />;
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
  const t = useTranslations(SERVICES_SCREEN_COPY_NAMESPACE);
  return (
    <span className="flex items-center gap-(--space-2)">
      <span className="text-(length:--font-size-body) font-semibold text-(--component-list-card-item-title)">
        {service.priceLabel}
      </span>
      {!service.isActive ? (
        <StatusChip tone="neutral" label={t("archived")} hasDot={false} />
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
