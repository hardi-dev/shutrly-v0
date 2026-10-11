import { useTranslations } from "next-intl";

import { formatShortDate } from "@/features/booking/domain/session/session";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PROJECT_COUNT_MESSAGE_KEY } from "../project-copy/project-copy.copy";
import { ProjectStatusChip } from "../project-status-chip/project-status-chip";
import { PROJECT_LIST_COPY_NAMESPACE } from "./project-list.copy";
import type { ProjectListProps } from "./project-list.types";

/** Renders the compact phone project list: title, client and next session date, and the status chip. */
export function ProjectList({
  workspaceId,
  tab,
  count,
  rows,
  action,
  emptyState,
  renderMenu,
}: Readonly<ProjectListProps>) {
  const t = useTranslations(PROJECT_LIST_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  return (
    <SectionCard
      title={t("listTitle")}
      description={t(PROJECT_COUNT_MESSAGE_KEY[tab], { count })}
      actions={action}
      content="flush"
    >
      {rows.length === 0 ? (
        <div className="px-(--space-4)">{emptyState}</div>
      ) : (
        <ul aria-label={t("listTitle")}>
          {rows.map((row, index) => (
            <ListCardItem
              key={row.id}
              icon="folder-kanban"
              title={row.title}
              href={`/w/${workspaceId}/projects/${row.id}`}
              meta={`${row.clientName} · ${
                row.shownSession === null
                  ? t("metaNoSchedule")
                  : formatShortDate(row.shownSession.date, locale)
              }`}
              isLast={index === rows.length - 1}
              trailing={
                <span className="flex items-center gap-(--space-2)">
                  <ProjectStatusChip status={row.status} />
                  {renderMenu(row)}
                </span>
              }
            />
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
