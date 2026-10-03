import { formatShortDate } from "@/features/booking/domain/session/session";
import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { ProjectStatusChip } from "../project-status-chip/project-status-chip";
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
  return (
    <SectionCard
      title={PROJECT_COPY.listTitle}
      description={PROJECT_COPY.listCount(tab, count)}
      actions={action}
      content="flush"
    >
      {rows.length === 0 ? (
        <div className="px-(--space-4)">{emptyState}</div>
      ) : (
        <ul aria-label={PROJECT_COPY.listTitle}>
          {rows.map((row, index) => (
            <ListCardItem
              key={row.id}
              icon="folder-kanban"
              title={row.title}
              href={`/w/${workspaceId}/projects/${row.id}`}
              meta={`${row.clientName} · ${
                row.shownSession === null
                  ? PROJECT_COPY.metaNoSchedule
                  : formatShortDate(row.shownSession.date)
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
