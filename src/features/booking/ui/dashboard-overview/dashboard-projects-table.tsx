import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { ActiveProjectRow } from "@/features/booking/application/ports/dashboard-overview-reader/dashboard-overview-reader.port";
import { formatIdr } from "@/features/booking/domain/idr-amount/idr-amount";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { DataTable } from "@/ui/patterns/data-table/data-table";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Avatar } from "@/ui/primitives/avatar/avatar";

import { clientInitials } from "../client-initials/client-initials";
import { ProjectFilterButton } from "../project-filter-button/project-filter-button";
import { ProjectSearchField } from "../project-search-field/project-search-field";
import { listUrlAt, projectTabPath } from "../project-search-field/project-tab-path";
import { ProjectStatusChip } from "../project-status-chip/project-status-chip";
import { ProjectsEmptyState } from "../projects-empty-state/projects-empty-state";
import { DashboardNoActive } from "./dashboard-empty";
import { DashboardNextSession } from "./dashboard-next-session";
import {
  DASHBOARD_OVERVIEW_COPY_NAMESPACE,
  DASHBOARD_PROJECT_COPY_NAMESPACE,
} from "./dashboard-overview.copy";
import type { DashboardProjectsTableProps } from "./dashboard-projects-table.types";

/** The *Active projects* table in its card: the search row, the table with its footer, or one of the two empty states (AC-DASH-026…037). @param props - the page of rows, the search and filter, and the row menu @returns the card */
export function DashboardProjectsTable(props: Readonly<DashboardProjectsTableProps>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const isNoActive = props.total === 0 && !props.hasQuery;
  return (
    <SectionCard
      title={t("tableTitle")}
      actions={isNoActive ? null : <DashboardSearchRow {...props} />}
      content="bleed"
    >
      {isNoActive ? (
        <DashboardNoActive workspaceId={props.workspaceId} />
      ) : (
        <TableBody {...props} />
      )}
    </SectionCard>
  );
}

function DashboardSearchRow(props: Readonly<DashboardProjectsTableProps>) {
  return (
    <div className="flex w-full items-center gap-(--space-2)">
      <ProjectSearchField
        workspaceId={props.workspaceId}
        tab="ACTIVE"
        q={props.q}
        filter={props.filter}
        resultCount={props.rows.length}
        basePath={`/w/${props.workspaceId}`}
      />
      <ProjectFilterButton tab="ACTIVE" filter={props.filter} onPress={props.onOpenFilter} />
    </div>
  );
}

function TableBody(props: Readonly<DashboardProjectsTableProps>) {
  if (props.rows.length === 0) return <NoMatch workspaceId={props.workspaceId} />;
  return <ActiveRows {...props} />;
}

function NoMatch({ workspaceId }: Readonly<{ workspaceId: string }>) {
  const tp = useTranslations(DASHBOARD_PROJECT_COPY_NAMESPACE);
  return (
    <div className="p-(--space-4)">
      <ProjectsEmptyState
        tab="ACTIVE"
        hasQuery
        action={
          <Link href={`/w/${workspaceId}`} className="font-semibold underline">
            {tp("clearSearch")}
          </Link>
        }
      />
    </div>
  );
}

function ActiveRows(props: Readonly<DashboardProjectsTableProps>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const columns = [
    { id: "project", label: t("columnProject") },
    { id: "next", label: t("columnNextSession"), width: 150 },
    { id: "status", label: t("columnStatus"), width: 130 },
    { id: "price", label: t("columnAgreedPrice"), width: 110 },
    { id: "actions", "aria-label": t("columnActions"), width: 32 },
  ] as const;
  const renderCell = (row: ActiveProjectRow, columnId: string): ReactNode => (
    <DashboardCell
      workspaceId={props.workspaceId}
      row={row}
      columnId={columnId}
      today={props.today}
      menu={columnId === "actions" ? props.renderMenu(row) : null}
    />
  );
  return (
    <DataTable
      label={t("tableTitle")}
      columns={columns}
      rows={props.rows}
      renderCell={renderCell}
      footer={<FooterCount {...props} />}
    />
  );
}

function DashboardCell({
  workspaceId,
  row,
  columnId,
  today,
  menu,
}: Readonly<{
  workspaceId: string;
  row: ActiveProjectRow;
  columnId: string;
  today: string;
  menu: ReactNode;
}>) {
  const locale = useFormattingLocale();
  if (columnId === "project") return <ProjectCell workspaceId={workspaceId} row={row} />;
  if (columnId === "next") return <DashboardNextSession session={row.shownSession} today={today} />;
  if (columnId === "status") return <ProjectStatusChip status={row.status} />;
  if (columnId === "price") return <span>{formatIdr(row.agreedPrice, locale)}</span>;
  return <>{menu}</>;
}

function ProjectCell({
  workspaceId,
  row,
}: Readonly<{ workspaceId: string; row: ActiveProjectRow }>) {
  return (
    <span className="flex min-w-0 items-center gap-(--space-3)">
      <Avatar size="sm" initials={clientInitials(row.clientName)} aria-hidden />
      <span className="flex min-w-0 flex-col">
        <Link
          href={`/w/${workspaceId}/projects/${row.id}`}
          className="truncate font-semibold outline-none hover:underline focus-visible:underline"
        >
          {row.title}
        </Link>
        <span className="truncate text-(length:--font-size-label) text-(--color-semantic-text-muted)">
          {row.clientName}
        </span>
      </span>
    </span>
  );
}

function FooterCount(props: Readonly<DashboardProjectsTableProps>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const href = listUrlAt(projectTabPath(props.workspaceId, "ACTIVE"), props.q, props.filter);
  return (
    <div className="flex w-full items-center justify-between gap-(--space-3)">
      <span>{t("footerCount", { shown: props.rows.length, total: props.total })}</span>
      <Link href={href} className="font-semibold text-(--component-table-footer-link) underline">
        {t("footerLink")}
      </Link>
    </div>
  );
}
