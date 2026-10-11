import { useTranslations } from "next-intl";

import { displayTeamRoleName } from "@/features/booking/domain/team-role/team-role";
import { useAppLocale } from "@/ui/hooks/use-app-locale/use-app-locale";
import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { teamUsageText } from "../team-copy/team-copy.text";
import type { TeamTranslate } from "../team-copy/team-copy.types";
import { TeamRoleRowActions } from "../team-role-row-actions/team-role-row-actions";
import { TEAM_ROLES_TABLE_COPY_NAMESPACE } from "./team-roles-table.copy";
import type { TeamRolesTableProps } from "./team-roles-table.types";

// design.md: the usage column is 184 wide and the actions column 32 (literal sizes from Pencil).
function roleColumns(t: TeamTranslate) {
  return [
    { id: "role", label: t("roleColumn") },
    { id: "usage", label: t("usageColumn"), width: 184 },
    { id: "actions", "aria-label": t("actionsColumn"), width: 32 },
  ] as const;
}

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
  const t = useTranslations(TEAM_ROLES_TABLE_COPY_NAMESPACE);
  const locale = useAppLocale();
  function renderCell(row: TeamRolesTableProps["roles"][number], columnId: string) {
    if (columnId === "role")
      return <span className="truncate font-semibold">{displayTeamRoleName(row, locale)}</span>;
    if (columnId === "usage")
      return (
        <span className={row.usage > 0 ? undefined : "text-(--color-semantic-text-muted)"}>
          {teamUsageText(t, row.usage)}
        </span>
      );
    return <TeamRoleRowActions role={row} onEdit={onEdit} onDelete={onDelete} />;
  }
  return (
    <SectionCard
      title={t("rolesTitle")}
      description={t("rolesCountDesktop", { count: roles.length })}
      content="bleed"
    >
      {roles.length === 0 ? (
        <div className="p-(--space-4)">{emptyState}</div>
      ) : (
        <DataTable
          label={t("rolesTitle")}
          columns={roleColumns(t)}
          rows={roles}
          renderCell={renderCell}
          onRowAction={onEdit}
        />
      )}
    </SectionCard>
  );
}
