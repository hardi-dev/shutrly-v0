"use client";

import { createContext, type SyntheticEvent, useContext, useState } from "react";

import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { TeamMemberDialog } from "../team-member-dialog/team-member-dialog";
import type {
  AddTeamMemberButtonProps,
  TeamQuickAddProviderProps,
  TeamQuickAddValue,
} from "./team-quick-add.types";

const TeamQuickAddContext = createContext<TeamQuickAddValue | null>(null);

/** Gives the session dialogs below it what *Tambah anggota* needs: roles and the team actions. */
export function TeamQuickAddProvider({ value, children }: Readonly<TeamQuickAddProviderProps>) {
  return <TeamQuickAddContext.Provider value={value}>{children}</TeamQuickAddContext.Provider>;
}

/** Whether *Tambah anggota* can be offered here (a page provided the team actions). @returns true inside a provider */
export function useCanQuickAddMember(): boolean {
  return useContext(TeamQuickAddContext) !== null;
}

/** *Tambah anggota*: opens the Tim page's member dialog on top of the current dialog and hands back the new member (Revision OT #1, #2; Owner 2026-10-07: stacked). Renders nothing without a provider. */
export function AddTeamMemberButton({ onAdded, isDisabled }: Readonly<AddTeamMemberButtonProps>) {
  const value = useContext(TeamQuickAddContext);
  const [isOpen, setIsOpen] = useState(false);
  if (value === null) return null;
  const handleOpen = () => {
    setIsOpen(true);
  };
  // The dialog renders in a portal, but React still bubbles its submit to the session form around it.
  const stopSubmit = (event: SyntheticEvent) => {
    event.stopPropagation();
  };
  return (
    <div className="contents" onSubmit={stopSubmit}>
      <Button
        variant="secondary"
        iconLeading="user-plus"
        isDisabled={isDisabled}
        onPress={handleOpen}
      >
        {PROJECT_COPY.addTeamMember}
      </Button>
      <TeamMemberDialog
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        workspaceId={value.workspaceId}
        roles={value.roles}
        addAction={value.addAction}
        updateAction={value.updateAction}
        addRoleAction={value.addRoleAction}
        onAdded={onAdded}
      />
    </div>
  );
}
