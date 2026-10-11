import { useTranslations } from "next-intl";

import { formatWhatsappNumber } from "@/features/booking/domain/whatsapp-number/whatsapp-number";
import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Avatar } from "@/ui/primitives/avatar/avatar";

import { clientInitials } from "../client-initials/client-initials";
import { TEAM_COUNT_MESSAGE_KEY } from "../team-copy/team-copy.copy";
import type { TeamTranslate } from "../team-copy/team-copy.types";
import { memberRolesLabel } from "../team-member-roles/team-member-roles";
import { TEAM_MEMBERS_TABLE_COPY_NAMESPACE } from "./team-members-table.copy";
import type { TeamMembersTableProps } from "./team-members-table.types";

// design.md: the WhatsApp column is 184 wide, roles 200 and the actions column 32 (literal sizes from Pencil).
function memberColumns(t: TeamTranslate) {
  return [
    { id: "member", label: t("memberColumn") },
    { id: "whatsapp", label: t("whatsappColumn"), width: 184 },
    { id: "roles", label: t("memberRolesColumn"), width: 200 },
    { id: "actions", "aria-label": t("actionsColumn"), width: 32 },
  ] as const;
}

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
  const t = useTranslations(TEAM_MEMBERS_TABLE_COPY_NAMESPACE);
  function renderCell(row: TeamMembersTableProps["rows"][number], columnId: string) {
    if (columnId === "member") return <MemberCell name={row.name} />;
    if (columnId === "whatsapp") return <span>{formatWhatsappNumber(row.whatsappNumber)}</span>;
    if (columnId === "roles") return <span>{memberRolesLabel(row.roles)}</span>;
    return <>{renderActions?.(row)}</>;
  }
  return (
    <SectionCard
      title={t("membersTitle")}
      description={t(TEAM_COUNT_MESSAGE_KEY[status], { count })}
      actions={search}
      content="bleed"
    >
      {rows.length === 0 ? (
        <div className="p-(--space-4)">{emptyState}</div>
      ) : (
        <DataTable
          label={t("membersTitle")}
          columns={memberColumns(t)}
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
