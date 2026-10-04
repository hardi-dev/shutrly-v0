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

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import type { RoleActionViewProps, TeamRoleRowActionsProps } from "./team-role-row-actions.types";

/**
 * The ⋯ menu of a role row: *Ubah* and *Hapus*, as a menu on desktop and a sheet on phones.
 * @param props - the role and its handlers
 * @returns the trigger with its menu or sheet
 */
export function TeamRoleRowActions({ role, onEdit, onDelete }: Readonly<TeamRoleRowActionsProps>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  function handleEdit(): void {
    setIsOpen(false);
    onEdit(role);
  }
  function handleDelete(): void {
    setIsOpen(false);
    onDelete(role);
  }
  if (!isMobile) return <RoleMenu role={role} onEdit={handleEdit} onDelete={handleDelete} />;
  return (
    <RoleSheet
      role={role}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
}

function RoleMenu({ role, onEdit, onDelete }: Readonly<RoleActionViewProps>) {
  const label = TEAM_COPY.rowActions(role.name);
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        <MenuItem label={TEAM_COPY.edit} icon="pencil" onSelect={onEdit} />
        <MenuDivider />
        <MenuItem
          label={TEAM_COPY.delete}
          icon="trash-2"
          variant="destructive"
          onSelect={onDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}

function RoleSheet({
  role,
  isOpen,
  onOpenChange,
  onEdit,
  onDelete,
}: Readonly<RoleActionViewProps & { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }>) {
  function handleOpen(): void {
    onOpenChange(true);
  }
  return (
    <>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={TEAM_COPY.rowActions(role.name)}
        onPress={handleOpen}
      />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={role.name}
        meta={TEAM_COPY.usage(role.usage)}
        variant="actions"
      >
        <SheetItem label={TEAM_COPY.edit} icon="pencil" onPress={onEdit} />
        <SheetItem
          label={TEAM_COPY.delete}
          icon="trash-2"
          variant="destructive"
          onPress={onDelete}
        />
      </BottomSheet>
    </>
  );
}
