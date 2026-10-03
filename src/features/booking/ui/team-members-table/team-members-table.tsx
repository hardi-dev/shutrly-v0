import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Avatar } from "@/ui/primitives/avatar/avatar";

import { clientInitials } from "../client-initials/client-initials";
import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { memberRolesLabel } from "../team-member-roles/team-member-roles";
import type { TeamMembersTableProps } from "./team-members-table.types";

// design.md: the WhatsApp column is 184 wide, roles 200 and the actions column 32 (literal sizes from Pencil).
const COLUMNS = [
  { id: "member", label: TEAM_COPY.memberColumn },
  { id: "whatsapp", label: TEAM_COPY.whatsappColumn, width: 184 },
  { id: "roles", label: TEAM_COPY.memberRolesColumn, width: 200 },
  { id: "actions", "aria-label": TEAM_COPY.actionsColumn, width: 32 },
] as const;

/**
 * The desktop *Daftar anggota* table inside its section card.
 * @param props - the tab, the rows, the search box, the empty state and the row handlers
 * @returns the section card holding the table
 */
export function TeamMembersTable({
  status,
  count,
  rows,
  emptyState,
  search,
  onEdit,
  renderActions,
}: Readonly<TeamMembersTableProps>) {
  function renderCell(row: TeamMembersTableProps["rows"][number], columnId: string) {
    if (columnId === "member") return <MemberCell name={row.name} />;
    if (columnId === "whatsapp") return <span>{formatWhatsappNumber(row.whatsappNumber)}</span>;
    if (columnId === "roles") return <span>{memberRolesLabel(row.roles)}</span>;
    return <>{renderActions?.(row)}</>;
  }
  return (
    <SectionCard
      title={TEAM_COPY.membersTitle}
      description={TEAM_COPY.membersCount(status, count)}
      actions={search}
      content="bleed"
    >
      {rows.length === 0 ? (
        <div className="p-(--space-4)">{emptyState}</div>
      ) : (
        <DataTable
          label={TEAM_COPY.membersTitle}
          columns={COLUMNS}
          rows={rows}
          renderCell={renderCell}
          onRowAction={onEdit}
        />
      )}
    </SectionCard>
  );
}

function MemberCell({ name }: Readonly<{ name: string }>) {
  return (
    <span className="flex min-w-0 items-center gap-(--space-3)">
      <Avatar initials={clientInitials(name)} size="md" aria-hidden />
      <span className="truncate font-semibold">{name}</span>
    </span>
  );
}
