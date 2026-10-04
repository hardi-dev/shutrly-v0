import type { ReactNode } from "react";

import type { TeamRoleRecord } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

export interface TeamRolesTableProps {
  readonly roles: readonly TeamRoleRecord[];
  readonly emptyState: ReactNode;
  readonly onEdit: (role: TeamRoleRecord) => void;
  readonly onDelete: (role: TeamRoleRecord) => void;
}
