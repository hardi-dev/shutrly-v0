"use client";
/* eslint-disable max-lines-per-function -- responsive row actions share their handlers */

import { useTranslations } from "next-intl";
import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { SESSION_ROW_ACTIONS_COPY_NAMESPACE } from "./session-row-actions.copy";
import type { SessionRowActionsProps } from "./session-row-actions.types";

/** The ⋯ menu of a session row: Ubah and Hapus, as a menu on desktop and an actions sheet on phones. */
export function SessionRowActions({
  name,
  onEdit,
  onDelete,
  deleteHint,
  isDetail = false,
  teamAction,
}: Readonly<SessionRowActionsProps>) {
  const t = useTranslations(SESSION_ROW_ACTIONS_COPY_NAMESPACE);
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const label = t("sessionActions", { sessionName: name });
  const editLabel = isDetail ? t("editSessionDetail") : t("editSession");
  const deleteLabel = isDetail ? t("deleteSessionConfirm") : t("deleteSession");
  const handleOpen = () => {
    setIsOpen(true);
  };
  const handleEdit = () => {
    setIsOpen(false);
    onEdit();
  };
  const handleDelete = () => {
    setIsOpen(false);
    onDelete();
  };
  const handleTeam = () => {
    setIsOpen(false);
    teamAction?.onSelect();
  };
  if (isMobile) {
    return (
      <>
        <IconButton icon="more-horizontal" size="sm" aria-label={label} onPress={handleOpen} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={name} variant="actions">
          {teamAction ? (
            <SheetItem label={teamAction.label} icon={teamAction.icon} onPress={handleTeam} />
          ) : null}
          <SheetItem label={editLabel} icon="pencil" onPress={handleEdit} />
          <SheetItem
            label={deleteLabel}
            icon="trash-2"
            variant="destructive"
            isDisabled={deleteHint !== undefined}
            onPress={handleDelete}
          />
          {deleteHint ? (
            <p className="px-(--space-4) pb-(--space-3) text-(length:--font-size-label) text-(--color-semantic-text-secondary)">
              {deleteHint}
            </p>
          ) : null}
        </BottomSheet>
      </>
    );
  }
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        {teamAction ? (
          <MenuItem
            label={teamAction.label}
            icon={teamAction.icon}
            onSelect={teamAction.onSelect}
          />
        ) : null}
        <MenuItem label={editLabel} icon="pencil" onSelect={onEdit} />
        {teamAction ? <MenuDivider /> : null}
        <MenuItem
          label={deleteLabel}
          description={deleteHint}
          icon="trash-2"
          variant="destructive"
          isDisabled={deleteHint !== undefined}
          onSelect={onDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}
/* eslint-enable max-lines-per-function -- responsive row actions share their handlers */
