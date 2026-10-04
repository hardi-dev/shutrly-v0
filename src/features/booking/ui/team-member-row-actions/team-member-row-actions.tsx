"use client";

import { useState } from "react";

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

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { memberRolesLabel } from "../team-member-roles/team-member-roles";
import type {
  MemberActionViewProps,
  TeamMemberRowActionsProps,
} from "./team-member-row-actions.types";

/**
 * The ⋯ menu of a member row: *Ubah*, *Buka WhatsApp*, *Arsipkan* or *Pulihkan*, and *Hapus*,
 * as a menu on desktop and an action sheet on phones.
 * @param props - the member and its handlers
 * @returns the trigger with its menu or sheet
 */
export function TeamMemberRowActions(props: Readonly<TeamMemberRowActionsProps>) {
  const isMobile = useMobileViewport();
  const [isOpen, setIsOpen] = useState(false);
  if (!isMobile) return <MemberMenu {...props} />;
  function closeThen(action: () => void): void {
    setIsOpen(false);
    action();
  }
  return <MemberSheet {...props} closeThen={closeThen} isOpen={isOpen} onOpenChange={setIsOpen} />;
}

function MemberMenu({
  member,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
}: Readonly<MemberActionViewProps>) {
  const label = TEAM_COPY.rowActions(member.name);
  function handleEdit(): void {
    onEdit(member);
  }
  function handleToggleArchive(): void {
    if (member.isArchived) onRestore(member);
    else onArchive(member);
  }
  function handleDelete(): void {
    onDelete(member);
  }
  return (
    <MenuTrigger label={label}>
      <IconButton icon="more-horizontal" size="sm" aria-label={label} />
      <Menu aria-label={label}>
        <MenuItem label={TEAM_COPY.edit} icon="pencil" onSelect={handleEdit} />
        <MenuItem
          label={TEAM_COPY.openWhatsapp}
          icon="message-circle"
          href={whatsappChatUrl(member.whatsappNumber)}
          target="_blank"
        />
        <MenuItem
          label={member.isArchived ? TEAM_COPY.restore : TEAM_COPY.archive}
          icon={member.isArchived ? "archive-restore" : "archive"}
          onSelect={handleToggleArchive}
        />
        <MenuDivider />
        <MenuItem
          label={TEAM_COPY.delete}
          icon="trash-2"
          variant="destructive"
          onSelect={handleDelete}
        />
      </Menu>
    </MenuTrigger>
  );
}

function MemberSheet({
  member,
  isOpen,
  onOpenChange,
  ...handlers
}: Readonly<MemberActionViewProps & { isOpen: boolean; onOpenChange: (isOpen: boolean) => void }>) {
  function handleOpen(): void {
    onOpenChange(true);
  }
  return (
    <>
      <IconButton
        icon="more-horizontal"
        size="sm"
        aria-label={TEAM_COPY.rowActions(member.name)}
        onPress={handleOpen}
      />
      <BottomSheet
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        title={member.name}
        meta={`${formatWhatsappNumber(member.whatsappNumber)} · ${memberRolesLabel(member.roles)}`}
        variant="actions"
      >
        <MemberSheetItems member={member} {...handlers} />
      </BottomSheet>
    </>
  );
}

function MemberSheetItems({
  member,
  onEdit,
  onArchive,
  onRestore,
  onDelete,
  closeThen,
}: Readonly<MemberActionViewProps>) {
  function handleEdit(): void {
    closeThen?.(() => {
      onEdit(member);
    });
  }
  function handleToggleArchive(): void {
    closeThen?.(() => {
      if (member.isArchived) onRestore(member);
      else onArchive(member);
    });
  }
  function handleDelete(): void {
    closeThen?.(() => {
      onDelete(member);
    });
  }
  return (
    <>
      <SheetItem label={TEAM_COPY.edit} icon="pencil" onPress={handleEdit} />
      <SheetItem
        label={TEAM_COPY.openWhatsapp}
        icon="message-circle"
        href={whatsappChatUrl(member.whatsappNumber)}
        target="_blank"
      />
      <SheetItem
        label={member.isArchived ? TEAM_COPY.restore : TEAM_COPY.archive}
        icon={member.isArchived ? "archive-restore" : "archive"}
        onPress={handleToggleArchive}
      />
      <SheetItem
        label={TEAM_COPY.delete}
        icon="trash-2"
        variant="destructive"
        onPress={handleDelete}
      />
    </>
  );
}
