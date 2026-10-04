import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { DeleteTeamMemberResult } from "@/features/booking/application/use-cases/team-results/team-results.types";

export interface DeleteTeamMemberDialogProps {
  readonly member: TeamMemberRecord | null;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly action: (workspaceId: string, memberId: string) => Promise<DeleteTeamMemberResult>;
}

export interface DeleteMemberView {
  readonly title: string;
  readonly description: string;
  /** Set once the member is known to have assignments; the dialog then only offers *Tutup*. */
  readonly isBlocked: boolean;
  readonly isPending: boolean;
  readonly close: () => void;
  readonly confirm: () => void;
}
