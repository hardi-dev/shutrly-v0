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
import type {
  CatalogActionSurfaceProps,
  CatalogRowActionsProps,
  CatalogSheetItemsProps,
  MobileCatalogActionsProps,
  RowActionHandlers,
} from "./catalog-row-actions.types";

export function CatalogRowActions(props: Readonly<CatalogRowActionsProps>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const handlers = useRowActionHandlers(props, () => {
    setIsOpen(false);
  });
  if (isMobile) {
    return (
      <MobileCatalogActions
        props={props}
        handlers={handlers}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    );
  }
  return <DesktopCatalogActions props={props} handlers={handlers} />;
}

function useRowActionHandlers(
  props: Readonly<CatalogRowActionsProps>,
  close: () => void,
): RowActionHandlers {
  const { isActive, kind, onEdit, onRename, onDelete } = props;
  async function active(): Promise<void> {
    const nextActive = !isActive;
    await props.setActiveAction(props.workspaceId, kind, props.id, nextActive);
    showToast({
      tone: "success",
      title: nextActive ? CATALOG_COPY.unarchivedToast : CATALOG_COPY.archivedToast(kind),
      action: {
        label: CATALOG_COPY.undo,
        onAction: () => {
          void props.setActiveAction(props.workspaceId, kind, props.id, !nextActive);
        },
      },
    });
  }
  return {
    actionLabel: isActive ? CATALOG_COPY.archive : CATALOG_COPY.unarchive,
    onEdit: () => {
      close();
      onEdit?.();
    },
    onRename: () => {
      close();
      onRename?.();
    },
    onActive: () => {
      close();
      void active();
    },
    onDelete: () => {
      close();
      onDelete?.();
    },
  };
}

function MobileCatalogActions({
  props,
  handlers,
  isOpen,
  setIsOpen,
}: Readonly<MobileCatalogActionsProps>) {
  function handleOpen(): void {
    setIsOpen(true);
  }

  return (
    <>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={CATALOG_COPY.rowActions(props.name)}
        onPress={handleOpen}
      />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={props.name}
        meta={props.meta}
        variant="actions"
      >
        <CatalogSheetItems kind={props.kind} handlers={handlers} />
      </BottomSheet>
    </>
  );
}

function CatalogSheetItems({ kind, handlers }: Readonly<CatalogSheetItemsProps>) {
  return (
    <>
      {kind === "service" || kind === "definition" ? (
        <SheetItem label={CATALOG_COPY.edit} icon="pencil" onPress={handlers.onEdit} />
      ) : null}
      {kind === "category" ? (
        <SheetItem label={CATALOG_COPY.rename} icon="pencil" onPress={handlers.onRename} />
      ) : null}
      <SheetItem label={handlers.actionLabel} icon="power" onPress={handlers.onActive} />
      <SheetItem
        label={CATALOG_COPY.delete}
        icon="trash-2"
        variant="destructive"
        onPress={handlers.onDelete}
      />
    </>
  );
}

function DesktopCatalogActions({ props, handlers }: Readonly<CatalogActionSurfaceProps>) {
  const label = CATALOG_COPY.rowActions(props.name);
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        {props.kind === "service" || props.kind === "definition" ? (
          <MenuItem label={CATALOG_COPY.edit} icon="pencil" onSelect={handlers.onEdit} />
        ) : null}
        {props.kind === "category" ? (
          <MenuItem label={CATALOG_COPY.rename} icon="pencil" onSelect={handlers.onRename} />
        ) : null}
        <MenuItem label={handlers.actionLabel} icon="power" onSelect={handlers.onActive} />
        <MenuDivider />
        <MenuItem
          label={CATALOG_COPY.delete}
          icon="trash-2"
          variant="destructive"
          onSelect={handlers.onDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}
