"use client";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { displayTeamRoleName } from "@/features/booking/domain/team-role/team-role";
import { useAppLocale } from "@/ui/hooks/use-app-locale/use-app-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { BottomSheet } from "@/ui/patterns/bottom-sheet/bottom-sheet";
import { Menu } from "@/ui/patterns/menu/menu";
import { MenuDivider } from "@/ui/patterns/menu/menu-divider";
import { MenuItem } from "@/ui/patterns/menu/menu-item";
import { MenuTrigger } from "@/ui/patterns/menu/menu-trigger";
import { SheetItem } from "@/ui/patterns/sheet-item/sheet-item";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { teamUsageText } from "../team-copy/team-copy.text";
import { TEAM_ROLE_ROW_ACTIONS_COPY_NAMESPACE } from "./team-role-row-actions.copy";
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
  const t = useTranslations(TEAM_ROLE_ROW_ACTIONS_COPY_NAMESPACE);
  const locale = useAppLocale();
  const label = t("rowActions", { name: displayTeamRoleName(role, locale) });
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        <MenuItem label={t("edit")} icon="pencil" onSelect={onEdit} />
        <MenuDivider />
        <MenuItem label={t("delete")} icon="trash-2" variant="destructive" onSelect={onDelete} />
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
  const t = useTranslations(TEAM_ROLE_ROW_ACTIONS_COPY_NAMESPACE);
  const locale = useAppLocale();
  function handleOpen(): void {
    onOpenChange(true);
  }
  return (
    <>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={t("rowActions", { name: displayTeamRoleName(role, locale) })}
        onPress={handleOpen}
      />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={displayTeamRoleName(role, locale)}
        meta={teamUsageText(t, role.usage)}
        variant="actions"
      >
        <SheetItem label={t("edit")} icon="pencil" onPress={onEdit} />
        <SheetItem label={t("delete")} icon="trash-2" variant="destructive" onPress={onDelete} />
      </BottomSheet>
    </>
  );
}
