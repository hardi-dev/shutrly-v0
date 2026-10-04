import type { TeamRoleRecord } from "@/features/booking/application/ports/team-role-repository/team-role-repository.port";

export interface TeamRoleRowActionsProps {
  readonly role: TeamRoleRecord;
  readonly onEdit: (role: TeamRoleRecord) => void;
  readonly onDelete: (role: TeamRoleRecord) => void;
}

export interface RoleActionViewProps {
  readonly role: TeamRoleRowActionsProps["role"];
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}
