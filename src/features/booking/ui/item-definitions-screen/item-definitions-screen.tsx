"use client";

import { useState } from "react";

import type { ItemDefinitionRecord } from "@/features/booking/application/ports/item-definition-repository/item-definition-repository.port";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogRowActions } from "../catalog-row-actions/catalog-row-actions";
import { CatalogTabsBar } from "../catalog-tabs-bar/catalog-tabs-bar";
import { definitionIcon } from "../definition-icon/definition-icon";
import { DeleteCatalogDialog } from "../delete-catalog-dialog/delete-catalog-dialog";
import { ItemDefinitionDialog } from "../item-definition-dialog/item-definition-dialog";
import type { ItemDefinitionsScreenProps } from "./item-definitions-screen.types";

function labelForType(valueType: "NUMBER" | "RANGE"): string {
  return CATALOG_COPY.valueTypes[valueType];
}

export function ItemDefinitionsScreen({
  workspaceId,
  definitions,
  addAction,
  updateAction,
  setActiveAction,
  removeAction,
}: Readonly<ItemDefinitionsScreenProps>) {
  const dialogs = useItemDefinitionDialogs();
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
      <CatalogTabsBar workspaceId={workspaceId} activeTab="items" />
      <PageActions>
        <Button iconLeading="plus" onPress={dialogs.openAdd}>
          {CATALOG_COPY.addItem}
        </Button>
      </PageActions>
      <DefinitionGroups
        definitions={definitions}
        workspaceId={workspaceId}
        setActiveAction={setActiveAction}
        onEdit={dialogs.openEdit}
        onDelete={dialogs.openDelete}
      />
      <DefinitionDialogs
        workspaceId={workspaceId}
        addAction={addAction}
        updateAction={updateAction}
        dialogs={dialogs}
        setActiveAction={setActiveAction}
        removeAction={removeAction}
      />
    </main>
  );
}

function DefinitionGroups({
  definitions,
  workspaceId,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly definitions: ItemDefinitionsScreenProps["definitions"];
  readonly workspaceId: string;
  readonly setActiveAction: ItemDefinitionsScreenProps["setActiveAction"];
  readonly onEdit: (definition: ItemDefinitionRecord) => void;
  readonly onDelete: (definition: ItemDefinitionRecord) => void;
}>) {
  return (
    <>
      <DefinitionGroup
        title={CATALOG_COPY.selectionGroupTitle}
        definitions={definitions.selection}
        workspaceId={workspaceId}
        setActiveAction={setActiveAction}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <DefinitionGroup
        title={CATALOG_COPY.otherGroupTitle}
        definitions={definitions.other}
        workspaceId={workspaceId}
        setActiveAction={setActiveAction}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  );
}

function DefinitionDialogs({
  workspaceId,
  addAction,
  updateAction,
  dialogs,
  setActiveAction,
  removeAction,
}: Readonly<{
  readonly workspaceId: string;
  readonly addAction: ItemDefinitionsScreenProps["addAction"];
  readonly updateAction: ItemDefinitionsScreenProps["updateAction"];
  readonly dialogs: ReturnType<typeof useItemDefinitionDialogs>;
  readonly setActiveAction: ItemDefinitionsScreenProps["setActiveAction"];
  readonly removeAction: ItemDefinitionsScreenProps["removeAction"];
}>) {
  return (
    <>
      {addAction ? (
        <ItemDefinitionDialog
          key={dialogs.editing?.id ?? "new-definition"}
          isOpen={dialogs.isDialogOpen}
          onOpenChange={dialogs.setIsDialogOpen}
          workspaceId={workspaceId}
          definition={dialogs.editing}
          action={addAction}
          updateAction={updateAction}
        />
      ) : null}
      {dialogs.deleting && setActiveAction && removeAction ? (
        <DeleteCatalogDialog
          isOpen
          workspaceId={workspaceId}
          kind="definition"
          entry={dialogs.deleting}
          isInUse={dialogs.deleting.usageCount > 0}
          usage={CATALOG_COPY.definitionUsage(dialogs.deleting.usageCount)}
          onOpenChange={dialogs.closeDelete}
          removeAction={removeAction}
          setActiveAction={setActiveAction}
        />
      ) : null}
    </>
  );
}

function useItemDefinitionDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ItemDefinitionRecord | undefined>();
  const [deleting, setDeleting] = useState<ItemDefinitionRecord | undefined>();
  function openAdd(): void {
    setEditing(undefined);
    setIsDialogOpen(true);
  }
  function openEdit(definition: ItemDefinitionRecord): void {
    setEditing(definition);
    setIsDialogOpen(true);
  }
  function openDelete(definition: ItemDefinitionRecord): void {
    setDeleting(definition);
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

function DefinitionGroup({
  title,
  definitions,
  workspaceId,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly title: string;
  readonly definitions: readonly ItemDefinitionRecord[];
  readonly workspaceId: string;
  readonly setActiveAction: ItemDefinitionsScreenProps["setActiveAction"];
  readonly onEdit: (definition: ItemDefinitionRecord) => void;
  readonly onDelete: (definition: ItemDefinitionRecord) => void;
}>) {
  return (
    <SectionCard title={title} content="flush">
      <ul aria-label={title}>
        {definitions.map((definition, index) => (
          <DefinitionRow
            key={definition.id}
            definition={definition}
            workspaceId={workspaceId}
            isLast={index === definitions.length - 1}
            setActiveAction={setActiveAction}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </ul>
    </SectionCard>
  );
}

function DefinitionRow({
  definition,
  workspaceId,
  isLast,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly definition: ItemDefinitionRecord;
  readonly workspaceId: string;
  readonly isLast: boolean;
  readonly setActiveAction: ItemDefinitionsScreenProps["setActiveAction"];
  readonly onEdit: (definition: ItemDefinitionRecord) => void;
  readonly onDelete: (definition: ItemDefinitionRecord) => void;
}>) {
  function handleEdit(): void {
    onEdit(definition);
  }
  function handleDelete(): void {
    onDelete(definition);
  }
  return (
    <ListCardItem
      icon={definitionIcon(definition)}
      title={definition.name}
      meta={CATALOG_COPY.definitionMeta(
        labelForType(definition.valueType),
        definition.unit,
        definition.usageCount,
      )}
      isLast={isLast}
      trailing={
        <DefinitionRowTrailing
          definition={definition}
          workspaceId={workspaceId}
          setActiveAction={setActiveAction}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      }
    />
  );
}

function DefinitionRowTrailing({
  definition,
  workspaceId,
  setActiveAction,
  onEdit,
  onDelete,
}: Readonly<{
  readonly definition: ItemDefinitionRecord;
  readonly workspaceId: string;
  readonly setActiveAction: ItemDefinitionsScreenProps["setActiveAction"];
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}>) {
  return (
    <span className="flex items-center gap-(--space-2)">
      {definition.selectionType ? (
        <StatusChip
          tone="info"
          label={CATALOG_COPY.selectionTypes[definition.selectionType]}
          hasDot={false}
        />
      ) : null}
      {!definition.isActive ? (
        <StatusChip tone="neutral" label={CATALOG_COPY.archived} hasDot={false} />
      ) : null}
      {setActiveAction ? (
        <CatalogRowActions
          workspaceId={workspaceId}
          kind="definition"
          id={definition.id}
          name={definition.name}
          isActive={definition.isActive}
          meta={CATALOG_COPY.definitionMeta(
            labelForType(definition.valueType),
            definition.unit,
            definition.usageCount,
          )}
          onEdit={onEdit}
          onDelete={onDelete}
          setActiveAction={setActiveAction}
        />
      ) : null}
    </span>
  );
}
