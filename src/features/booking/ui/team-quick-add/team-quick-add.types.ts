import type { ReactNode } from "react";

import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { RoleRef } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

import type { TeamMemberDialogProps } from "../team-member-dialog/team-member-dialog.types";

/** What a page hands down so a session dialog can add a member without leaving it (Revision OT #1, #2). */
export interface TeamQuickAddValue {
  readonly workspaceId: string;
  readonly roles: readonly RoleRef[];
  readonly addAction: TeamMemberDialogProps["addAction"];
  readonly updateAction: TeamMemberDialogProps["updateAction"];
  readonly addRoleAction: TeamMemberDialogProps["addRoleAction"];
}

export interface TeamQuickAddProviderProps {
  readonly value: TeamQuickAddValue;
  readonly children: ReactNode;
}

export interface AddTeamMemberButtonProps {
  /** The new member, with their roles by name. */
  readonly onAdded: (member: AssignableMember) => void;
  readonly isDisabled?: boolean;
}
