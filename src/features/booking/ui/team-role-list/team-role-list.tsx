import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { TeamRoleRowActions } from "../team-role-row-actions/team-role-row-actions";
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
  return (
    <SectionCard
      title={TEAM_COPY.rolesTitle}
      description={TEAM_COPY.rolesCountMobile(roles.length)}
      actions={action}
      content="flush"
    >
      {roles.length === 0 ? (
        <div className="px-(--space-4)">{emptyState}</div>
      ) : (
        <ul aria-label={TEAM_COPY.rolesTitle}>
          {roles.map((role, index) => (
            <ListCardItem
              key={role.id}
              // Deviation: the export draws no leading element; ListCardItem requires one (as F-07).
              icon="user-round-cog"
              title={role.name}
              meta={TEAM_COPY.usage(role.usage)}
              isLast={index === roles.length - 1}
              trailing={<TeamRoleRowActions role={role} onEdit={onEdit} onDelete={onDelete} />}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
