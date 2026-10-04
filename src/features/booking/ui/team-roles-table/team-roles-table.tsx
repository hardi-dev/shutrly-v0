import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { TeamRoleRowActions } from "../team-role-row-actions/team-role-row-actions";
import type { TeamRolesTableProps } from "./team-roles-table.types";

// design.md: the usage column is 184 wide and the actions column 32 (literal sizes from Pencil).
const COLUMNS = [
  { id: "role", label: TEAM_COPY.roleColumn },
  { id: "usage", label: TEAM_COPY.usageColumn, width: 184 },
  { id: "actions", "aria-label": TEAM_COPY.actionsColumn, width: 32 },
] as const;

/**
 * The desktop *Daftar peran* table: each role with how many members use it.
 * @param props - the roles, the empty state and the row handlers
 * @returns the section card holding the table
 */
export function TeamRolesTable({
  roles,
  emptyState,
  onEdit,
  onDelete,
}: Readonly<TeamRolesTableProps>) {
  function renderCell(row: TeamRolesTableProps["roles"][number], columnId: string) {
    if (columnId === "role") return <span className="truncate font-semibold">{row.name}</span>;
    if (columnId === "usage")
      return (
        <span className={row.usage > 0 ? undefined : "text-(--color-semantic-text-muted)"}>
          {TEAM_COPY.usage(row.usage)}
        </span>
      );
    return <TeamRoleRowActions role={row} onEdit={onEdit} onDelete={onDelete} />;
  }
  return (
    <SectionCard
      title={TEAM_COPY.rolesTitle}
      description={TEAM_COPY.rolesCountDesktop(roles.length)}
      content="bleed"
    >
      {roles.length === 0 ? (
        <div className="p-(--space-4)">{emptyState}</div>
      ) : (
        <DataTable
          label={TEAM_COPY.rolesTitle}
          columns={COLUMNS}
          rows={roles}
          renderCell={renderCell}
          onRowAction={onEdit}
        />
      )}
    </SectionCard>
  );
}
