import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { TeamPick } from "@/features/booking/domain/session-assignment/session-assignment.types";

export interface SessionTeamFieldProps {
  /** Active members with their roles. */
  readonly members: readonly AssignableMember[];
  readonly picks: readonly TeamPick[];
  readonly onChange: (picks: readonly TeamPick[]) => void;
  readonly isDisabled?: boolean;
}

export interface TeamPickerState {
  readonly memberId: string | null;
  readonly roleId: string | null;
}
