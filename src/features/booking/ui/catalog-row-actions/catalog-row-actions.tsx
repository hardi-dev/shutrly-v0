"use client";

import { useId, useState } from "react";

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

// The next dialog opens once the action sheet has finished its 300ms exit and
// returned focus, so it captures the row trigger rather than <body>.
const SHEET_HANDOFF_DELAY_MS = 400;

export function CatalogRowActions(props: Readonly<CatalogRowActionsProps>) {
  const isMobile = useMobileViewport();
  const triggerId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const handlers = useRowActionHandlers(
    props,
    () => {
      setIsOpen(false);
    },
    triggerId,
    isMobile,
  );
  if (isMobile) {
    return (
      <MobileCatalogActions
        props={props}
        handlers={handlers}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        triggerId={triggerId}
      />
    );
  }
  return <DesktopCatalogActions props={props} handlers={handlers} triggerId={triggerId} />;
}

function useRowActionHandlers(
  props: Readonly<CatalogRowActionsProps>,
  close: () => void,
  triggerId: string,
  isMobile: boolean,
): RowActionHandlers {
  const { isActive, kind, onEdit, onRename, onDelete } = props;
  function closeThen(callback?: () => void): void {
    close();
    if (callback) {
      window.setTimeout(
        () => {
          document.getElementById(triggerId)?.focus();
          callback();
        },
        isMobile ? SHEET_HANDOFF_DELAY_MS : 0,
      );
    }
  }
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
      closeThen(onEdit);
    },
    onRename: () => {
      closeThen(onRename);
    },
    onActive: () => {
      close();
      void active();
    },
    onDelete: () => {
      closeThen(onDelete);
    },
  };
}

function MobileCatalogActions({
  props,
  handlers,
  isOpen,
  setIsOpen,
  triggerId,
}: Readonly<MobileCatalogActionsProps>) {
  function handleOpen(): void {
    setIsOpen(true);
  }

  return (
    <>
      <IconButton
        id={triggerId}
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

function DesktopCatalogActions({
  props,
  handlers,
  triggerId,
}: Readonly<CatalogActionSurfaceProps & { triggerId: string }>) {
  const label = CATALOG_COPY.rowActions(props.name);
  return (
    <MenuTrigger label={label}>
      <IconButton id={triggerId} icon="more-horizontal" size="sm" aria-label={label} />
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
