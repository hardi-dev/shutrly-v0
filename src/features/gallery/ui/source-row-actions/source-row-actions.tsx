"use client";

import { useTranslations } from "next-intl";
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

import { PROVIDER_TITLE_MESSAGE_KEY } from "../source-copy/source-copy.copy";
import { SOURCE_ROW_ACTIONS_COPY_NAMESPACE } from "./source-row-actions.copy";
import type { SourceRowActionsProps } from "./source-row-actions.types";

// eslint-disable-next-line max-lines-per-function -- mirrors one action set across desktop and phone surfaces
export function SourceRowActions({
  workspaceId,
  source,
  onRename,
  onDelete,
  setActiveAction,
}: Readonly<SourceRowActionsProps>) {
  const t = useTranslations(SOURCE_ROW_ACTIONS_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const nextActive = !source.isActive;
  const activeLabel = source.isActive ? t("deactivate") : t("activate");

  async function handleActive(): Promise<void> {
    await setActiveAction(workspaceId, source.id, nextActive);
    showToast({
      tone: "success",
      title: nextActive ? t("activatedTitle") : t("deactivatedTitle"),
      body: nextActive
        ? t("activatedBody", { name: source.displayName })
        : t("deactivatedBody", { name: source.displayName }),
      action: {
        label: t("undo"),
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
      <SheetItem label={t("rename")} icon="pencil" onPress={handleRename} />
      <SheetItem label={activeLabel} icon="power" onPress={handleActivePress} />
      <SheetItem label={t("delete")} icon="trash-2" variant="destructive" onPress={handleDelete} />
    </>
  );

  if (isMobile) {
    return (
      <>
        <IconButton
          icon="more-horizontal"
          size="sm"
          aria-label={t("rowActions", { name: source.displayName })}
          onPress={handleOpen}
        />
        <BottomSheet
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          title={source.displayName}
          meta={`${t(PROVIDER_TITLE_MESSAGE_KEY[source.provider])} · ${source.isActive ? t("active") : t("inactive")}`}
          variant="actions"
        >
          {items}
        </BottomSheet>
      </>
    );
  }

  return (
    <MenuTrigger label={t("rowActions", { name: source.displayName })}>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={t("rowActions", { name: source.displayName })}
      />
      <Menu aria-label={t("rowActions", { name: source.displayName })}>
        <MenuItem label={t("rename")} icon="pencil" onSelect={onRename} />
        <MenuItem label={activeLabel} icon="power" onSelect={handleActivePress} />
        <MenuDivider />
        <MenuItem label={t("delete")} icon="trash-2" variant="destructive" onSelect={onDelete} />
      </Menu>
    </MenuTrigger>
  );
}
