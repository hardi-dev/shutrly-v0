"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { CATALOG_COPY } from "../catalog-copy/catalog-copy.copy";
import type {
  DetailActionHandlers,
  DetailActionSurfaceProps,
  MobileDetailActionsProps,
  ServiceDetailRowActionsProps,
} from "./service-detail-row-actions.types";

export function ServiceDetailRowActions(props: Readonly<ServiceDetailRowActionsProps>) {
  const mobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  function close(): void {
    setIsOpen(false);
  }
  const handlers = useDetailActionHandlers(props, close);
  if (mobile)
    return (
      <MobileDetailActions
        props={props}
        handlers={handlers}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
      />
    );
  return <DesktopDetailActions props={props} handlers={handlers} />;
}

function useDetailActionHandlers(
  props: Readonly<ServiceDetailRowActionsProps>,
  close: () => void,
): DetailActionHandlers {
  const editLabel = props.kind === "item" ? CATALOG_COPY.editItemValue : CATALOG_COPY.editField;
  const deleteLabel = props.kind === "item" ? CATALOG_COPY.removeItem : CATALOG_COPY.removeField;
  return {
    editLabel,
    deleteLabel,
    onEdit: () => {
      close();
      props.onEdit();
    },
    onMoveUp: () => {
      close();
      props.onMoveUp();
    },
    onMoveDown: () => {
      close();
      props.onMoveDown();
    },
    onDelete: () => {
      close();
      props.onDelete();
    },
  };
}

function MobileDetailActions({
  props,
  handlers,
  isOpen,
  setIsOpen,
}: Readonly<MobileDetailActionsProps>) {
  function open(): void {
    setIsOpen(true);
  }
  return (
    <>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={CATALOG_COPY.rowActions(props.name)}
        onPress={open}
      />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        title={props.name}
        meta={props.meta}
        variant="actions"
      >
        <SheetItem label={handlers.editLabel} icon="pencil" onPress={handlers.onEdit} />
        <SheetItem
          label={CATALOG_COPY.moveUp}
          icon="arrow-up"
          isDisabled={!props.canMoveUp}
          onPress={handlers.onMoveUp}
        />
        <SheetItem
          label={CATALOG_COPY.moveDown}
          icon="arrow-down"
          isDisabled={!props.canMoveDown}
          onPress={handlers.onMoveDown}
        />
        <SheetItem
          label={handlers.deleteLabel}
          icon="trash-2"
          variant="destructive"
          onPress={handlers.onDelete}
        />
      </BottomSheet>
    </>
  );
}

function DesktopDetailActions({ props, handlers }: Readonly<DetailActionSurfaceProps>) {
  const label = CATALOG_COPY.rowActions(props.name);
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        <MenuItem label={handlers.editLabel} icon="pencil" onSelect={handlers.onEdit} />
        <MenuItem
          label={CATALOG_COPY.moveUp}
          icon="arrow-up"
          isDisabled={!props.canMoveUp}
          onSelect={handlers.onMoveUp}
        />
        <MenuItem
          label={CATALOG_COPY.moveDown}
          icon="arrow-down"
          isDisabled={!props.canMoveDown}
          onSelect={handlers.onMoveDown}
        />
        <MenuDivider />
        <MenuItem
          label={handlers.deleteLabel}
          icon="trash-2"
          variant="destructive"
          onSelect={handlers.onDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}
