import { useTranslations } from "next-intl";

import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { teamUsageText } from "../team-copy/team-copy.text";
import { TeamRoleRowActions } from "../team-role-row-actions/team-role-row-actions";
import { TEAM_ROLE_LIST_COPY_NAMESPACE } from "./team-role-list.copy";
import type { TeamRoleListProps } from "./team-role-list.types";

/**
 * The phone *Daftar peran* list card.
 * @param props - the roles, the add button, the empty state and the row handlers
 * @returns the section card holding the list
 */
export function TeamRoleList({
  roles,
  action,
  emptyState,
  onEdit,
  onDelete,
}: Readonly<TeamRoleListProps>) {
  const t = useTranslations(TEAM_ROLE_LIST_COPY_NAMESPACE);
  return (
    <SectionCard
      title={t("rolesTitle")}
      description={t("rolesCountMobile", { count: roles.length })}
      actions={action}
      content="flush"
    >
      {roles.length === 0 ? (
        <div className="px-(--space-4)">{emptyState}</div>
      ) : (
        <ul aria-label={t("rolesTitle")}>
          {roles.map((role, index) => (
            <ListCardItem
              key={role.id}
              // Deviation: the export draws no leading element; ListCardItem requires one (as F-07).
              icon="user-round-cog"
              title={role.name}
              meta={teamUsageText(t, role.usage)}
              isLast={index === roles.length - 1}
              trailing={<TeamRoleRowActions role={role} onEdit={onEdit} onDelete={onDelete} />}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
