"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { DeleteTeamRoleDialog } from "../delete-team-role-dialog/delete-team-role-dialog";
import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { TeamRoleDialog } from "../team-role-dialog/team-role-dialog";
import { TeamRoleList } from "../team-role-list/team-role-list";
import { TeamRolesTable } from "../team-roles-table/team-roles-table";
import { TeamTabsBar } from "../team-tabs-bar/team-tabs-bar";
import type { RolesDialogsProps, TeamRolesScreenProps } from "./team-roles-screen.types";
import { useRolesDialog } from "./use-roles-dialog";

/**
 * The *Tim › Peran* screen: the workspace's roles with add, rename and delete.
 * @param props - the roles and the server actions
 * @returns the responsive screen with its dialogs
 */
export function TeamRolesScreen(props: Readonly<TeamRolesScreenProps>) {
  const { workspaceId, roles } = props;
  const isMobile = useMobileViewport();
  const { dialog, openAdd, openEdit, openDelete, handleOpenChange } = useRolesDialog();
  const addButton = (
    <Button iconLeading="plus" onPress={openAdd}>
      {isMobile ? TEAM_COPY.addRoleShort : TEAM_COPY.addRole}
    </Button>
  );
  const emptyState = (
    <EmptyState
      placement="in-card"
      icon="user-round-cog"
      title={TEAM_COPY.rolesEmptyTitle}
      body={TEAM_COPY.rolesEmptyBody}
      action={isMobile ? addButton : undefined}
    />
  );
  const rows = { roles, emptyState, onEdit: openEdit, onDelete: openDelete };
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)">
      <PageActions>{addButton}</PageActions>
      <TeamTabsBar workspaceId={workspaceId} tab="ROLES" />
      {isMobile ? <TeamRoleList {...rows} action={addButton} /> : <TeamRolesTable {...rows} />}
      <RolesDialogs {...props} dialog={dialog} onOpenChange={handleOpenChange} />
    </main>
  );
}

function RolesDialogs({
  workspaceId,
  dialog,
  onOpenChange,
  addAction,
  renameAction,
  deleteAction,
}: Readonly<TeamRolesScreenProps & RolesDialogsProps>) {
  const isForm = dialog?.kind === "add" || dialog?.kind === "edit";
  return (
    <>
      <TeamRoleDialog
        key={dialog?.kind === "edit" ? dialog.role.id : "new-role"}
        isOpen={isForm}
        workspaceId={workspaceId}
        role={dialog?.kind === "edit" ? dialog.role : undefined}
        onOpenChange={onOpenChange}
        addAction={addAction}
        renameAction={renameAction}
      />
      <DeleteTeamRoleDialog
        role={dialog?.kind === "delete" ? dialog.role : null}
        workspaceId={workspaceId}
        onOpenChange={onOpenChange}
        action={deleteAction}
      />
    </>
  );
}
