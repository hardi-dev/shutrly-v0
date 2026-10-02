"use client";
/* eslint-disable max-lines-per-function, no-restricted-syntax -- coordinates the catalog dialogs and row actions */

import { useState } from "react";

import type { CategoryRecord } from "@/features/booking/application/ports/category-repository/category-repository.port";
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
import type { CategoriesScreenProps } from "./categories-screen.types";

export function CategoriesScreen({
  workspaceId,
  categories,
  addAction,
  renameAction,
  setActiveAction,
  removeAction,
}: Readonly<CategoriesScreenProps>) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryRecord | undefined>();
  const [deleting, setDeleting] = useState<CategoryRecord | undefined>();
  const openAdd = () => {
    setEditing(undefined);
    setIsDialogOpen(true);
  };
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
      <CatalogTabsBar workspaceId={workspaceId} activeTab="categories" />
      <PageActions>
        <Button iconLeading="plus" onPress={openAdd}>
          {CATALOG_COPY.addCategory}
        </Button>
      </PageActions>
      <SectionCard
        title={CATALOG_COPY.categoriesTitle}
        description={CATALOG_COPY.categoriesDescription}
        content="flush"
      >
        <ul aria-label={CATALOG_COPY.categoriesTitle}>
          {categories.map((category, index) => (
            <ListCardItem
              key={category.id}
              icon="folder"
              title={category.name}
              meta={CATALOG_COPY.categoryMeta(category.serviceCount)}
              isLast={index === categories.length - 1}
              trailing={
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
                      onRename={() => {
                        setEditing(category);
                        setIsDialogOpen(true);
                      }}
                      onDelete={() => {
                        setDeleting(category);
                      }}
                      setActiveAction={setActiveAction}
                    />
                  ) : null}
                </span>
              }
            />
          ))}
        </ul>
      </SectionCard>
      {addAction && renameAction ? (
        <CategoryDialog
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
          onOpenChange={(open) => {
            if (!open) setDeleting(undefined);
          }}
          removeAction={removeAction}
          setActiveAction={setActiveAction}
        />
      ) : null}
    </main>
  );
}
/* eslint-enable max-lines-per-function, no-restricted-syntax -- end catalog dialog coordinator */
