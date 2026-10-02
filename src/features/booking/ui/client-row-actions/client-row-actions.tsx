"use client";
/* eslint-disable max-lines-per-function, no-restricted-syntax, @typescript-eslint/no-confusing-void-expression -- responsive action groups share callbacks */

import { useEffect, useState } from "react";

import {
  formatWhatsappNumber,
  whatsappChatUrl,
} from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { ClientRowActionsProps } from "./client-row-actions.types";

/** Responsive row-action menu for a client record. */
export function ClientRowActions(props: Readonly<ClientRowActionsProps>) {
  const mobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const actionLabel = CLIENT_COPY.rowActions(props.client.name);
  const archive = props.status === "ACTIVE";
  useRestoreActionFocus(actionLabel, props.client.id);
  function closeThen(action: () => void): void {
    setIsOpen(false);
    action();
  }
  const items = mobile ? (
    <MobileItems {...props} archive={archive} closeThen={closeThen} />
  ) : (
    <DesktopItems {...props} archive={archive} />
  );
  const trigger = (
    <IconButton
      icon="more-horizontal"
      size="sm"
      aria-label={actionLabel}
      onPress={() => setIsOpen(true)}
    />
  );
  if (mobile)
    return (
      <>
        <>{trigger}</>
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title={props.client.name}
          meta={
            props.client.whatsappNumber
              ? formatWhatsappNumber(props.client.whatsappNumber)
              : CLIENT_COPY.noWhatsapp
          }
          variant="actions"
        >
          {items}
        </BottomSheet>
      </>
    );
  return (
    <MenuTrigger label={actionLabel}>
      <IconButton
        data-client-row-action={props.client.id}
        icon="more-horizontal"
        size="sm"
        aria-label={actionLabel}
      />
      <Menu aria-label={actionLabel}>{items}</Menu>
    </MenuTrigger>
  );
}

function useRestoreActionFocus(actionLabel: string, clientId: string): void {
  useEffect(() => {
    function restoreFocus(event: KeyboardEvent): void {
      const matchingMenuIsOpen = Array.from(document.querySelectorAll("[role=menu]")).some(
        (menu) => menu.getAttribute("aria-label") === actionLabel,
      );
      if (event.key !== "Escape" || !matchingMenuIsOpen) return;
      window.setTimeout(() => {
        document
          .querySelector<HTMLButtonElement>(`[data-client-row-action="${clientId}"]`)
          ?.focus();
      });
    }
    document.addEventListener("keydown", restoreFocus, true);
    return () => {
      document.removeEventListener("keydown", restoreFocus, true);
    };
  }, [actionLabel, clientId]);
}

function DesktopItems({
  client,
  archive,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: Readonly<ClientRowActionsProps & { archive: boolean }>) {
  return (
    <>
      <MenuItem label={CLIENT_COPY.edit} icon="pencil" onSelect={onEdit} />
      {client.whatsappNumber ? (
        <MenuItem
          label={CLIENT_COPY.openWhatsapp}
          icon="message-circle"
          href={whatsappChatUrl(client.whatsappNumber)}
          target="_blank"
        />
      ) : null}
      <MenuItem
        label={archive ? CLIENT_COPY.archive : CLIENT_COPY.restore}
        icon={archive ? "archive" : "archive-restore"}
        onSelect={archive ? onArchive : onRestore}
      />
      <MenuDivider />
      <MenuItem
        label={CLIENT_COPY.delete}
        icon="trash-2"
        variant="destructive"
        onSelect={onDelete}
      />
    </>
  );
}

function MobileItems({
  client,
  archive,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  closeThen,
}: Readonly<
  ClientRowActionsProps & { archive: boolean; closeThen: (action: () => void) => void }
>) {
  return (
    <>
      <SheetItem label={CLIENT_COPY.edit} icon="pencil" onPress={() => closeThen(onEdit)} />
      {client.whatsappNumber ? (
        <SheetItem
          label={CLIENT_COPY.openWhatsapp}
          icon="message-circle"
          href={whatsappChatUrl(client.whatsappNumber)}
          target="_blank"
        />
      ) : null}
      <SheetItem
        label={archive ? CLIENT_COPY.archive : CLIENT_COPY.restore}
        icon={archive ? "archive" : "archive-restore"}
        onPress={() => closeThen(archive ? onArchive : onRestore)}
      />
      <SheetItem
        label={CLIENT_COPY.delete}
        icon="trash-2"
        variant="destructive"
        onPress={() => closeThen(onDelete)}
      />
    </>
  );
}
/* eslint-enable max-lines-per-function, no-restricted-syntax, @typescript-eslint/no-confusing-void-expression -- end responsive action groups */
