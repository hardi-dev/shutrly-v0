import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";

export interface TeamMemberRowActionsProps {
  readonly member: TeamMemberRecord;
  readonly onEdit: (member: TeamMemberRecord) => void;
  readonly onArchive: (member: TeamMemberRecord) => void;
  readonly onRestore: (member: TeamMemberRecord) => void;
  readonly onDelete: (member: TeamMemberRecord) => void;
}

export interface MemberActionViewProps extends TeamMemberRowActionsProps {
  /** Closes the sheet before the action runs; the desktop menu closes itself. */
  readonly closeThen?: (action: () => void) => void;
}
