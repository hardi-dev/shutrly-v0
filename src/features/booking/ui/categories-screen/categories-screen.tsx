"use client";

import type { ReactNode } from "react";
import { useState } from "react";

import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import { CatalogRowActions } from "../catalog-row-actions/catalog-row-actions";
import { CatalogTabsBar } from "../catalog-tabs-bar/catalog-tabs-bar";
import { CategoryDialog } from "../category-dialog/category-dialog";
import { DeleteCatalogDialog } from "../delete-catalog-dialog/delete-catalog-dialog";
import type { CategoriesScreenProps, CategoryDialogsProps } from "./categories-screen.types";

export function CategoriesScreen(props: Readonly<CategoriesScreenProps>) {
  const { workspaceId, categories, addAction, renameAction, setActiveAction, removeAction } = props;
  const dialogs = useCategoryDialogs();
  const addButton = (
    <Button iconLeading="plus" onPress={dialogs.openAdd}>
      {CATALOG_COPY.addCategory}
    </Button>
  );
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
      <CatalogTabsBar workspaceId={workspaceId} activeTab="categories" />
      <PageActions>{addButton}</PageActions>
      <SectionCard
        title={CATALOG_COPY.categoriesTitle}
        description={CATALOG_COPY.categoriesDescription}
        content="flush"
      >
        <CategoryRows
          workspaceId={workspaceId}
          categories={categories}
          addButton={addButton}
          setActiveAction={setActiveAction}
          removeAction={removeAction}
          onRename={dialogs.openRename}
          onDelete={dialogs.openDelete}
        />
      </SectionCard>
      <CategoryDialogs
        workspaceId={workspaceId}
        isDialogOpen={dialogs.isDialogOpen}
        setIsDialogOpen={dialogs.setIsDialogOpen}
        editing={dialogs.editing}
        addAction={addAction}
        renameAction={renameAction}
        deleting={dialogs.deleting}
        removeAction={removeAction}
        setActiveAction={setActiveAction}
        closeDelete={dialogs.closeDelete}
      />
    </main>
  );
}

function useCategoryDialogs() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRecord | undefined>();
  const [deleting, setDeleting] = useState<CategoryRecord | undefined>();
  function openAdd(): void {
    setEditing(undefined);
    setIsDialogOpen(true);
  }
  function openRename(category: CategoryRecord): void {
    setEditing(category);
    setIsDialogOpen(true);
  }
  function openDelete(category: CategoryRecord): void {
    setDeleting(category);
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
    openRename,
    openDelete,
    closeDelete,
  };
}

function CategoryRows({
  workspaceId,
  categories,
  addButton,
  setActiveAction,
  removeAction,
  onRename,
  onDelete,
}: Readonly<
  CategoriesScreenProps & {
    readonly addButton: ReactNode;
    readonly onRename: (category: CategoryRecord) => void;
    readonly onDelete: (category: CategoryRecord) => void;
  }
>) {
  if (categories.length === 0) {
    return (
      <EmptyState
        placement="in-card"
        icon="folder"
        title={CATALOG_COPY.categoriesEmptyTitle}
        body={CATALOG_COPY.categoriesEmptyBody}
        action={addButton}
      />
    );
  }

  return (
    <ul aria-label={CATALOG_COPY.categoriesTitle}>
      {categories.map((category, index) => (
        <CategoryRow
          key={category.id}
          workspaceId={workspaceId}
          category={category}
          isLast={index === categories.length - 1}
          setActiveAction={setActiveAction}
          removeAction={removeAction}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}

function CategoryRow({
  workspaceId,
  category,
  isLast,
  setActiveAction,
  removeAction,
  onRename,
  onDelete,
}: Readonly<{
  readonly workspaceId: string;
  readonly category: CategoryRecord;
  readonly isLast: boolean;
  readonly setActiveAction: CategoriesScreenProps["setActiveAction"];
  readonly removeAction: CategoriesScreenProps["removeAction"];
  readonly onRename: (category: CategoryRecord) => void;
  readonly onDelete: (category: CategoryRecord) => void;
}>) {
  function handleRename(): void {
    onRename(category);
  }
  function handleDelete(): void {
    onDelete(category);
  }
  return (
    <ListCardItem
      icon="folder"
      title={category.name}
      meta={CATALOG_COPY.categoryMeta(category.serviceCount)}
      isLast={isLast}
      trailing={
        !category.isActive || (setActiveAction && removeAction) ? (
          <CategoryRowTrailing
            workspaceId={workspaceId}
            category={category}
            setActiveAction={setActiveAction}
            removeAction={removeAction}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        ) : undefined
      }
    />
  );
}

function CategoryRowTrailing({
  workspaceId,
  category,
  setActiveAction,
  removeAction,
  onRename,
  onDelete,
}: Readonly<{
  readonly workspaceId: string;
  readonly category: CategoryRecord;
  readonly setActiveAction: CategoriesScreenProps["setActiveAction"];
  readonly removeAction: CategoriesScreenProps["removeAction"];
  readonly onRename: (category: CategoryRecord) => void;
  readonly onDelete: (category: CategoryRecord) => void;
}>) {
  function handleRename(): void {
    onRename(category);
  }
  function handleDelete(): void {
    onDelete(category);
  }
  return (
    <span className="flex items-center gap-(--space-2)">
      {!category.isActive ? (
        <StatusChip tone="neutral" label={CATALOG_COPY.archived} hasDot={false} />
      ) : null}
      {setActiveAction && removeAction ? (
        <CatalogRowActions
          workspaceId={workspaceId}
          kind="category"
          id={category.id}
          name={category.name}
          isActive={category.isActive}
          meta={CATALOG_COPY.categoryMeta(category.serviceCount)}
          onRename={handleRename}
          onDelete={handleDelete}
          setActiveAction={setActiveAction}
        />
      ) : null}
    </span>
  );
}

function CategoryDialogs(props: Readonly<CategoryDialogsProps>) {
  const {
    workspaceId,
    isDialogOpen,
    setIsDialogOpen,
    editing,
    addAction,
    renameAction,
    deleting,
    removeAction,
    setActiveAction,
    closeDelete,
  } = props;
  return (
    <>
      {addAction && renameAction ? (
        <CategoryDialog
          key={editing?.id ?? "new-category"}
          isOpen={isDialogOpen}
          workspaceId={workspaceId}
          category={editing}
          onOpenChange={setIsDialogOpen}
          action={addAction}
          renameAction={renameAction}
        />
      ) : null}
      {deleting && removeAction && setActiveAction ? (
        <DeleteCatalogDialog
          isOpen={Boolean(deleting)}
          workspaceId={workspaceId}
          kind="category"
          entry={deleting}
          isInUse={deleting.serviceCount > 0}
          usage={CATALOG_COPY.categoryUsage(deleting.serviceCount)}
          onOpenChange={closeDelete}
          removeAction={removeAction}
          setActiveAction={setActiveAction}
        />
      ) : null}
    </>
  );
}
