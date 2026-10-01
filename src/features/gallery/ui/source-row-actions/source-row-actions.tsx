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

import { PROVIDER_COPY, SOURCE_COPY } from "../source-copy/source-copy.copy";
import type { SourceRowActionsProps } from "./source-row-actions.types";

// eslint-disable-next-line max-lines-per-function -- mirrors one action set across desktop and phone surfaces
export function SourceRowActions({
  workspaceId,
  source,
  onRename,
  onDelete,
  setActiveAction,
}: Readonly<SourceRowActionsProps>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const nextActive = !source.isActive;
  const activeLabel = source.isActive ? SOURCE_COPY.deactivate : SOURCE_COPY.activate;

  async function handleActive(): Promise<void> {
    await setActiveAction(workspaceId, source.id, nextActive);
    showToast({
      tone: "success",
      title: nextActive ? SOURCE_COPY.activatedTitle : SOURCE_COPY.deactivatedTitle,
      body: nextActive
        ? SOURCE_COPY.activatedBody(source.displayName)
        : SOURCE_COPY.deactivatedBody(source.displayName),
      action: {
        label: SOURCE_COPY.undo,
        onAction: () => {
          void setActiveAction(workspaceId, source.id, !nextActive);
        },
      },
    });
  }

  function handleRename(): void {
    setIsOpen(false);
    onRename();
  }

  function handleDelete(): void {
    setIsOpen(false);
    onDelete();
  }

  function handleActivePress(): void {
    setIsOpen(false);
    void handleActive();
  }

  function handleOpen(): void {
    setIsOpen(true);
  }

  const items = (
    <>
      <SheetItem label={SOURCE_COPY.rename} icon="pencil" onPress={handleRename} />
      <SheetItem label={activeLabel} icon="power" onPress={handleActivePress} />
      <SheetItem
        label={SOURCE_COPY.delete}
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
          aria-label={SOURCE_COPY.rowActions(source.displayName)}
          onPress={handleOpen}
        />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title={source.displayName}
          meta={`${PROVIDER_COPY[source.provider].title} · ${source.isActive ? SOURCE_COPY.active : SOURCE_COPY.inactive}`}
          variant="actions"
        >
          {items}
        </BottomSheet>
      </>
    );
  }

  return (
    <MenuTrigger label={SOURCE_COPY.rowActions(source.displayName)}>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={SOURCE_COPY.rowActions(source.displayName)}
      />
      <Menu aria-label={SOURCE_COPY.rowActions(source.displayName)}>
        <MenuItem label={SOURCE_COPY.rename} icon="pencil" onSelect={onRename} />
        <MenuItem label={activeLabel} icon="power" onSelect={handleActivePress} />
        <MenuDivider />
        <MenuItem
          label={SOURCE_COPY.delete}
          icon="trash-2"
          variant="destructive"
          onSelect={onDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}
