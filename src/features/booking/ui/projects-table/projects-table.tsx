import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { ProjectListRow } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import { formatSessionWhen } from "@/features/booking/domain/session/session";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PROJECT_COUNT_MESSAGE_KEY } from "../project-copy/project-copy.copy";
import { ProjectStatusChip } from "../project-status-chip/project-status-chip";
import { PROJECTS_TABLE_COPY_NAMESPACE } from "./projects-table.copy";
import type { ProjectsTableProps } from "./projects-table.types";

/** Renders the desktop project table inside its Section Card; only the PROYEK text is a link. */
export function ProjectsTable({
  workspaceId,
  tab,
  count,
  rows,
  emptyState,
  search,
  renderMenu,
}: Readonly<ProjectsTableProps>) {
  const t = useTranslations(PROJECTS_TABLE_COPY_NAMESPACE);
  const columns = [
    { id: "project", label: t("columnProject") },
    { id: "event", label: t("columnEvent"), width: 240 },
    { id: "status", label: t("columnStatus"), width: 124 },
    { id: "actions", "aria-label": t("columnActions"), width: 32 },
  ] as const;
  const renderCell = (row: ProjectListRow, columnId: string): ReactNode => (
    <TableCell
      workspaceId={workspaceId}
      row={row}
      columnId={columnId}
      menu={columnId === "actions" ? renderMenu(row) : null}
    />
  );
  return (
    <SectionCard
      title={t("listTitle")}
      description={t(PROJECT_COUNT_MESSAGE_KEY[tab], { count })}
      actions={search}
      content="bleed"
    >
      {rows.length === 0 ? (
        <div className="p-(--space-4)">{emptyState}</div>
      ) : (
        <DataTable label={t("listTitle")} columns={columns} rows={rows} renderCell={renderCell} />
      )}
    </SectionCard>
  );
}

function TableCell({
  workspaceId,
  row,
  columnId,
  menu,
}: Readonly<{ workspaceId: string; row: ProjectListRow; columnId: string; menu: ReactNode }>) {
  if (columnId === "project") return <ProjectCell workspaceId={workspaceId} row={row} />;
  if (columnId === "event") return <EventCell row={row} />;
  if (columnId === "status") return <ProjectStatusChip status={row.status} />;
  return <>{menu}</>;
}

function ProjectCell({ workspaceId, row }: Readonly<{ workspaceId: string; row: ProjectListRow }>) {
  const t = useTranslations(PROJECTS_TABLE_COPY_NAMESPACE);
  return (
    <span className="flex min-w-0 flex-col">
      <Link
        href={`/w/${workspaceId}/projects/${row.id}`}
        className="line-clamp-2 font-semibold outline-none hover:underline focus-visible:underline"
      >
        {row.title}
      </Link>
      <span className="truncate text-(length:--font-size-label) text-(--color-semantic-text-muted)">
        {t("clientService", { client: row.clientName, service: row.serviceName })}
      </span>
    </span>
  );
}

function EventCell({ row }: Readonly<{ row: ProjectListRow }>) {
  const t = useTranslations(PROJECTS_TABLE_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const shown = row.shownSession;
  if (shown === null) {
    return <span className="text-(--color-semantic-text-muted)">{t("metaNoSchedule")}</span>;
  }
  const extra = row.sessionCount > 1 ? t("metaExtra", { count: row.sessionCount - 1 }) : null;
  const when = formatSessionWhen(shown, locale);
  return (
    <span className="flex min-w-0 flex-col">
      <span className="truncate">
        {shown.location === null && extra ? `${when} · ${extra}` : when}
      </span>
      {shown.location === null ? null : (
        <span className="truncate text-(length:--font-size-label) text-(--color-semantic-text-muted)">
          {extra ? `${shown.location} · ${extra}` : shown.location}
        </span>
      )}
    </span>
  );
}
