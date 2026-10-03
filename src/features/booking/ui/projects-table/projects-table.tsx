import Link from "next/link";
import type { ReactNode } from "react";

import type { ProjectListRow } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import { formatSessionWhen } from "@/features/booking/domain/session/session";
import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { ProjectStatusChip } from "../project-status-chip/project-status-chip";
import type { ProjectsTableProps } from "./projects-table.types";

const COLUMNS = [
  { id: "project", label: PROJECT_COPY.columnProject },
  { id: "event", label: PROJECT_COPY.columnEvent, width: 240 },
  { id: "status", label: PROJECT_COPY.columnStatus, width: 124 },
  { id: "actions", "aria-label": PROJECT_COPY.columnActions, width: 32 },
] as const;

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
      title={PROJECT_COPY.listTitle}
      description={PROJECT_COPY.listCount(tab, count)}
      actions={search}
      content="bleed"
    >
      {rows.length === 0 ? (
        <div className="p-(--space-4)">{emptyState}</div>
      ) : (
        <DataTable
          label={PROJECT_COPY.listTitle}
          columns={COLUMNS}
          rows={rows}
          renderCell={renderCell}
        />
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
  return (
    <span className="flex min-w-0 flex-col">
      <Link
        href={`/w/${workspaceId}/projects/${row.id}`}
        className="line-clamp-2 font-semibold outline-none hover:underline focus-visible:underline"
      >
        {row.title}
      </Link>
      <span className="truncate text-(length:--font-size-label) text-(--color-semantic-text-muted)">
        {PROJECT_COPY.clientService(row.clientName, row.serviceName)}
      </span>
    </span>
  );
}

function EventCell({ row }: Readonly<{ row: ProjectListRow }>) {
  const shown = row.shownSession;
  if (shown === null) {
    return (
      <span className="text-(--color-semantic-text-muted)">{PROJECT_COPY.metaNoSchedule}</span>
    );
  }
  const extra = row.sessionCount > 1 ? PROJECT_COPY.metaExtra(row.sessionCount - 1) : null;
  const when = formatSessionWhen(shown);
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
