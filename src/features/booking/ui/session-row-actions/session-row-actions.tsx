"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import type { SessionRowActionsProps } from "./session-row-actions.types";

/** The ⋯ menu of a session row: Ubah and Hapus, as a menu on desktop and an actions sheet on phones. */
export function SessionRowActions({ name, onEdit, onDelete }: Readonly<SessionRowActionsProps>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  const label = PROJECT_COPY.sessionActions(name);
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
  if (isMobile) {
    return (
      <>
        <IconButton icon="more-horizontal" size="sm" aria-label={label} onPress={handleOpen} />
        <BottomSheet isOpen={isOpen} onOpenChange={setIsOpen} title={name} variant="actions">
          <SheetItem label={PROJECT_COPY.editSession} icon="pencil" onPress={handleEdit} />
          <SheetItem
            label={PROJECT_COPY.deleteSession}
            icon="trash-2"
            variant="destructive"
            onPress={handleDelete}
          />
        </BottomSheet>
      </>
    );
  }
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        <MenuItem label={PROJECT_COPY.editSession} icon="pencil" onSelect={onEdit} />
        <MenuItem
          label={PROJECT_COPY.deleteSession}
          icon="trash-2"
          variant="destructive"
          onSelect={onDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}
