import type { ReactNode } from "react";

import type { NumberHolder } from "@/features/booking/application/ports/client-repository/client-repository.port";
import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { RoleRef } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type {
  TeamMemberValidationFailure,
  TeamMemberWriteResult,
} from "@/features/booking/application/use-cases/team-results/team-results.types";

import type { TeamRoleDialogProps } from "../team-role-dialog/team-role-dialog.types";

export interface TeamMemberDialogProps {
  readonly isOpen: boolean;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  /** Edit mode when present, add mode otherwise. */
  readonly member?: TeamMemberRecord;
  /** The workspace's roles, offered in the Peran field. */
  readonly roles: readonly RoleRef[];
  readonly addAction: (workspaceId: string, values: unknown) => Promise<TeamMemberWriteResult>;
  readonly updateAction: (
    workspaceId: string,
    memberId: string,
    values: unknown,
  ) => Promise<TeamMemberValidationFailure | undefined>;
  /** Creates a role from the Peran field's *Tambah peran baru* row. */
  readonly addRoleAction: TeamRoleDialogProps["addAction"];
}

export interface MemberErrorState {
  /** The member who already holds the typed number (AC-TEAM-006). */
  readonly numberHolder?: NumberHolder;
}

export interface ShellProps {
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly title: string;
  readonly isPending: boolean;
  readonly children: ReactNode;
}
