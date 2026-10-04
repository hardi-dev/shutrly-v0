import type { TeamRoleRecord } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";
import type { DeleteTeamRoleResult } from "@/features/booking/application/use-cases/team-results/team-results.types";

export interface DeleteTeamRoleDialogProps {
  readonly role: TeamRoleRecord | null;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (workspaceId: string, roleId: string) => Promise<DeleteTeamRoleResult>;
}

export interface DeleteRoleView {
  readonly title: string;
  readonly description: string;
  /** Set once the role is known to be in use; the dialog then only offers *Tutup*. */
  readonly isBlocked: boolean;
  readonly isPending: boolean;
  readonly close: () => void;
  readonly confirm: () => void;
}
