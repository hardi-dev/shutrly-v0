import type { ReactNode } from "react";

import type { TeamMembersTableProps } from "../team-members-table/team-members-table.types";

export interface TeamMemberListProps extends Pick<
  TeamMembersTableProps,
  "status" | "count" | "rows" | "emptyState" | "renderActions"
> {
  /** The card's *Tambah* button. */
  readonly action?: ReactNode;
}
