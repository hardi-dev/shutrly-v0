import type { ReactNode } from "react";

import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";

export interface TeamMembersTableProps {
  readonly status: TeamMemberStatus;
  readonly count: number;
  readonly rows: readonly TeamMemberRecord[];
  readonly emptyState: ReactNode;
  readonly search: ReactNode;
  /** Activating a row opens *Ubah* (A-1). */
  readonly onEdit?: (member: TeamMemberRecord) => void;
  /** The row's ⋯ menu, which Slice 3 supplies. */
  readonly renderActions?: (member: TeamMemberRecord) => ReactNode;
}
