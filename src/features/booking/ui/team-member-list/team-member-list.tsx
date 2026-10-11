import { useTranslations } from "next-intl";

import { useAppLocale } from "@/ui/hooks/use-app-locale/use-app-locale";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { clientInitials } from "../client-initials/client-initials";
import { TEAM_COUNT_MESSAGE_KEY } from "../team-copy/team-copy.copy";
import { memberRolesLabel } from "../team-member-roles/team-member-roles";
import { TEAM_MEMBER_LIST_COPY_NAMESPACE } from "./team-member-list.copy";
import type { TeamMemberListProps } from "./team-member-list.types";

/**
 * The phone *Daftar anggota* list card: avatar, name and the member's roles as meta.
 * @param props - the tab, the rows, the add button, the empty state and the row menu
 * @returns the section card holding the list
 */
export function TeamMemberList({
  status,
  count,
  rows,
  action,
  emptyState,
  renderActions,
}: Readonly<TeamMemberListProps>) {
  const t = useTranslations(TEAM_MEMBER_LIST_COPY_NAMESPACE);
  const locale = useAppLocale();
  return (
    <SectionCard
      title={t("membersTitle")}
      description={t(TEAM_COUNT_MESSAGE_KEY[status], { count })}
      actions={action}
      content="flush"
    >
      {rows.length === 0 ? (
        <div className="px-(--space-4)">{emptyState}</div>
      ) : (
        <ul aria-label={t("membersTitle")}>
          {rows.map((row, index) => (
            <ListCardItem
              key={row.id}
              avatarInitials={clientInitials(row.name)}
              title={row.name}
              meta={memberRolesLabel(row.roles, locale)}
              isLast={index === rows.length - 1}
              trailing={renderActions?.(row)}
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
