"use client";

import { useTranslations } from "next-intl";
import { useId, useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { SERVICE_DETAIL_ROW_ACTIONS_COPY_NAMESPACE } from "./service-detail-row-actions.copy";
import type {
  DetailActionHandlers,
  DetailActionSurfaceProps,
  MobileDetailActionsProps,
  ServiceDetailRowActionsProps,
} from "./service-detail-row-actions.types";

// The next dialog opens once the action sheet has finished its 300ms exit and
// returned focus, so it captures the row trigger rather than <body>.
const SHEET_HANDOFF_DELAY_MS = 400;

export function ServiceDetailRowActions(props: Readonly<ServiceDetailRowActionsProps>) {
  const mobile = useMobileViewport();
  const triggerId = useId();
  const [isOpen, setIsOpen] = useState(false);
  function close(): void {
    setIsOpen(false);
  }
  const handlers = useDetailActionHandlers(props, close, triggerId, mobile);
  if (mobile)
    return (
      <MobileDetailActions
        props={props}
        handlers={handlers}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        triggerId={triggerId}
      />
    );
  return <DesktopDetailActions props={props} handlers={handlers} triggerId={triggerId} />;
}

function useDetailActionHandlers(
  props: Readonly<ServiceDetailRowActionsProps>,
  close: () => void,
  triggerId: string,
  isMobile: boolean,
): DetailActionHandlers {
  const t = useTranslations(SERVICE_DETAIL_ROW_ACTIONS_COPY_NAMESPACE);
  const editLabel = props.kind === "item" ? t("editItemValue") : t("editField");
  const deleteLabel = props.kind === "item" ? t("removeItem") : t("removeField");
  function closeThen(callback: () => void): void {
    close();
    window.setTimeout(
      () => {
        document.getElementById(triggerId)?.focus();
        callback();
      },
      isMobile ? SHEET_HANDOFF_DELAY_MS : 0,
    );
  }
  return {
    editLabel,
    deleteLabel,
    onEdit: () => {
      closeThen(props.onEdit);
    },
    onMoveUp: () => {
      closeThen(props.onMoveUp);
    },
    onMoveDown: () => {
      closeThen(props.onMoveDown);
    },
    onDelete: () => {
      closeThen(props.onDelete);
    },
  };
}

function MobileDetailActions({
  props,
  handlers,
  isOpen,
  setIsOpen,
  triggerId,
}: Readonly<MobileDetailActionsProps>) {
  const t = useTranslations(SERVICE_DETAIL_ROW_ACTIONS_COPY_NAMESPACE);
  function open(): void {
    setIsOpen(true);
  }
  return (
    <>
      <IconButton
        id={triggerId}
        icon="more-horizontal"
        size="sm"
        aria-label={t("rowActions", { name: props.name })}
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
          label={t("moveUp")}
          icon="arrow-up"
          isDisabled={!props.canMoveUp}
          onPress={handlers.onMoveUp}
        />
        <SheetItem
          label={t("moveDown")}
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

function DesktopDetailActions({
  props,
  handlers,
  triggerId,
}: Readonly<DetailActionSurfaceProps & { triggerId: string }>) {
  const t = useTranslations(SERVICE_DETAIL_ROW_ACTIONS_COPY_NAMESPACE);
  const label = t("rowActions", { name: props.name });
  return (
    <MenuTrigger label={label}>
      <IconButton id={triggerId} icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        <MenuItem label={handlers.editLabel} icon="pencil" onSelect={handlers.onEdit} />
        <MenuItem
          label={t("moveUp")}
          icon="arrow-up"
          isDisabled={!props.canMoveUp}
          onSelect={handlers.onMoveUp}
        />
        <MenuItem
          label={t("moveDown")}
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
