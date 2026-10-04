import type { ReactNode } from "react";

import type { TeamMemberStatus } from "@/features/booking/domain/team-member/team-member.types";

export interface TeamMembersEmptyStateProps {
  readonly status: TeamMemberStatus;
  /** True while a search is active: the list is empty because nothing matches. */
  readonly hasQuery: boolean;
  /** The phone's *Tambah anggota* button; the desktop add button lives in the page header. */
  readonly addAction?: ReactNode;
  readonly onClearSearch: () => void;
}
