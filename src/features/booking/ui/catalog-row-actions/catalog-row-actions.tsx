"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { showToast } from "@/ui/patterns/toast/toast";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type { CatalogRowActionsProps } from "./catalog-row-actions.types";

// eslint-disable-next-line max-lines-per-function -- mirrors one catalog action set on desktop and phone
export function CatalogRowActions({
  workspaceId,
  kind,
  id,
  name,
  isActive,
  meta,
  onEdit,
  onRename,
  onDelete,
  setActiveAction,
}: Readonly<CatalogRowActionsProps>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const actionLabel = isActive ? CATALOG_COPY.archive : CATALOG_COPY.unarchive;

  async function handleActive(): Promise<void> {
    const nextActive = !isActive;
    await setActiveAction(workspaceId, kind, id, nextActive);
    showToast({
      tone: "success",
      title: nextActive ? CATALOG_COPY.unarchivedToast : CATALOG_COPY.archivedToast(kind),
      action: {
        label: CATALOG_COPY.undo,
        onAction: () => void setActiveAction(workspaceId, kind, id, !nextActive),
      },
    });
  }

  function closeAnd(callback?: () => void): void {
    setIsOpen(false);
    callback?.();
  }

  function handleEdit(): void {
    closeAnd(onEdit);
  }

  function handleRename(): void {
    closeAnd(onRename);
  }

  function handleActivePress(): void {
    setIsOpen(false);
    void handleActive();
  }

  function handleDelete(): void {
    closeAnd(onDelete);
  }

  function handleOpen(): void {
    setIsOpen(true);
  }

  const phoneItems = (
    <>
      {kind === "service" ? (
        <SheetItem label={CATALOG_COPY.edit} icon="pencil" onPress={handleEdit} />
      ) : null}
      {kind === "category" ? (
        <SheetItem label={CATALOG_COPY.rename} icon="pencil" onPress={handleRename} />
      ) : null}
      <SheetItem label={actionLabel} icon="power" onPress={handleActivePress} />
      <SheetItem
        label={CATALOG_COPY.delete}
        icon="trash-2"
        variant="destructive"
        onPress={handleDelete}
      />
    </>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          icon="more-horizontal"
          size="sm"
          aria-label={CATALOG_COPY.rowActions(name)}
          onPress={handleOpen}
        />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title={name}
          meta={meta}
          variant="actions"
        >
          {phoneItems}
        </BottomSheet>
      </>
    );
  }

  return (
    <MenuTrigger label={CATALOG_COPY.rowActions(name)}>
      <IconButton icon="more-horizontal" size="sm" aria-label={CATALOG_COPY.rowActions(name)} />
      <Menu aria-label={CATALOG_COPY.rowActions(name)}>
        {kind === "service" ? (
          <MenuItem label={CATALOG_COPY.edit} icon="pencil" onSelect={handleEdit} />
        ) : null}
        {kind === "category" ? (
          <MenuItem label={CATALOG_COPY.rename} icon="pencil" onSelect={handleRename} />
        ) : null}
        <MenuItem label={actionLabel} icon="power" onSelect={handleActivePress} />
        <MenuDivider />
        <MenuItem
          label={CATALOG_COPY.delete}
          icon="trash-2"
          variant="destructive"
          onSelect={handleDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}
