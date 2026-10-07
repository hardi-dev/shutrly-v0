import type { AssignableMember } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";

import type { useTeamPicker } from "./use-team-picker";

export interface SessionTeamFieldProps {
  /** Active members with their roles. */
  readonly members: readonly AssignableMember[];
  /** The picker the form owns, so it can save a choice the Owner has not added yet. */
  readonly picker: ReturnType<typeof useTeamPicker>;
  readonly isDisabled?: boolean;
  /** Picks a member just added from the empty state's *Tambah anggota* (Revision OT #1). */
  readonly onMemberAdded?: (member: AssignableMember) => void;
}

export interface TeamPickerState {
  readonly memberId: string | null;
  readonly roleId: string | null;
}
