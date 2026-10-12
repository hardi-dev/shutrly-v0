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
import { showToast } from "@/ui/patterns/toast/toast";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { CATALOG_ENTITY_MESSAGE_KEY } from "../catalog-copy/catalog-copy.copy";
import { CATALOG_ROW_ACTIONS_COPY_NAMESPACE } from "./catalog-row-actions.copy";
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

/** Closes the menu, then returns focus to the trigger and runs the callback after the hand-off. */
function closeThenFocus(close: () => void, triggerId: string, isMobile: boolean) {
  return (callback?: () => void): void => {
    close();
    if (!callback) return;
    window.setTimeout(
      () => {
        document.getElementById(triggerId)?.focus();
        callback();
      },
      isMobile ? SHEET_HANDOFF_DELAY_MS : 0,
    );
  };
}

function useRowActionHandlers(
  props: Readonly<CatalogRowActionsProps>,
  close: () => void,
  triggerId: string,
  isMobile: boolean,
): RowActionHandlers {
  const { isActive, kind, onEdit, onRename, onDelete } = props;
  const t = useTranslations(CATALOG_ROW_ACTIONS_COPY_NAMESPACE);
  const closeThen = closeThenFocus(close, triggerId, isMobile);
  async function active(): Promise<void> {
    const nextActive = !isActive;
    await props.setActiveAction(props.workspaceId, kind, props.id, nextActive);
    showToast({
      tone: "success",
      title: nextActive
        ? t("unarchivedToast")
        : t("archivedToast", { kind: t(CATALOG_ENTITY_MESSAGE_KEY[kind]) }),
      action: {
        label: t("undo"),
        onAction: () => {
          void props.setActiveAction(props.workspaceId, kind, props.id, !nextActive);
        },
      },
    });
  }
  return {
    actionLabel: isActive ? t("archive") : t("unarchive"),
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
  const t = useTranslations(CATALOG_ROW_ACTIONS_COPY_NAMESPACE);
  function handleOpen(): void {
    setIsOpen(true);
  }

  return (
    <>
      <IconButton
        id={triggerId}
        icon="more-horizontal"
        size="sm"
        aria-label={t("rowActions", { name: props.name })}
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
  const t = useTranslations(CATALOG_ROW_ACTIONS_COPY_NAMESPACE);
  return (
    <>
      {kind === "service" || kind === "definition" ? (
        <SheetItem label={t("edit")} icon="pencil" onPress={handlers.onEdit} />
      ) : null}
      {kind === "category" ? (
        <SheetItem label={t("rename")} icon="pencil" onPress={handlers.onRename} />
      ) : null}
      <SheetItem label={handlers.actionLabel} icon="power" onPress={handlers.onActive} />
      <SheetItem
        label={t("delete")}
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
  const t = useTranslations(CATALOG_ROW_ACTIONS_COPY_NAMESPACE);
  const label = t("rowActions", { name: props.name });
  return (
    <MenuTrigger label={label}>
      <IconButton id={triggerId} icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        {props.kind === "service" || props.kind === "definition" ? (
          <MenuItem label={t("edit")} icon="pencil" onSelect={handlers.onEdit} />
        ) : null}
        {props.kind === "category" ? (
          <MenuItem label={t("rename")} icon="pencil" onSelect={handlers.onRename} />
        ) : null}
        <MenuItem label={handlers.actionLabel} icon="power" onSelect={handlers.onActive} />
        <MenuDivider />
        <MenuItem
          label={t("delete")}
          icon="trash-2"
          variant="destructive"
          onSelect={handlers.onDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}
