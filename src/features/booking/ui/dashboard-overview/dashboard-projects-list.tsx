import Link from "next/link";
import { useTranslations } from "next-intl";

import { ListCardItem } from "@/ui/patterns/list-card-item/list-card-item";
import { SectionCard } from "@/ui/patterns/section-card/section-card";
import { Button } from "@/ui/primitives/button/button";

import { clientInitials } from "../client-initials/client-initials";
import { listUrlAt, projectTabPath } from "../project-search-field/project-tab-path";
import { ProjectStatusChip } from "../project-status-chip/project-status-chip";
import { DashboardNoActive } from "./dashboard-empty";
import { nextSessionText, useNextSessionTexts } from "./dashboard-next-session";
import { DASHBOARD_OVERVIEW_COPY_NAMESPACE } from "./dashboard-overview.copy";
import { DashboardNoMatch, DashboardSearchRow } from "./dashboard-projects-table";
import type { DashboardProjectsTableProps } from "./dashboard-projects-table.types";

/** The phone list (C43 Flush): the search row above the card, the count as the card description, one list card per project, and a full-width *View all projects* (AC-DASH-026…037). @param props - the page of rows, the search and filter, and the row menu @returns the list */
export function DashboardProjectsList(props: Readonly<DashboardProjectsTableProps>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const isNoActive = props.total === 0 && !props.hasQuery;
  const description = isNoActive
    ? undefined
    : t("footerCount", { shown: props.rows.length, total: props.total });
  return (
    <div className="flex flex-col gap-(--space-3)">
      {isNoActive ? null : <DashboardSearchRow {...props} />}
      <SectionCard title={t("tableTitle")} description={description} content="flush">
        <ListBody {...props} isNoActive={isNoActive} />
      </SectionCard>
    </div>
  );
}

function ListBody(props: Readonly<DashboardProjectsTableProps & { isNoActive: boolean }>) {
  if (props.isNoActive) {
    return (
      <div className="px-(--space-4)">
        <DashboardNoActive workspaceId={props.workspaceId} />
      </div>
    );
  }
  if (props.rows.length === 0) {
    return (
      <div className="px-(--space-4)">
        <DashboardNoMatch workspaceId={props.workspaceId} />
      </div>
    );
  }
  return (
    <>
      <CardRows {...props} />
      <div className="p-(--space-4)">
        <ViewAllLink workspaceId={props.workspaceId} q={props.q} filter={props.filter} />
      </div>
    </>
  );
}

function CardRows(props: Readonly<DashboardProjectsTableProps>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const { texts, locale } = useNextSessionTexts();
  return (
    <ul aria-label={t("tableTitle")}>
      {props.rows.map((row, index) => (
        <ListCardItem
          key={row.id}
          avatarInitials={clientInitials(row.clientName)}
          title={row.title}
          href={`/w/${props.workspaceId}/projects/${row.id}`}
          meta={`${row.clientName} · ${nextSessionText(row.shownSession, props.today, texts, locale)}`}
          isLast={index === props.rows.length - 1}
          trailing={
            <span className="flex items-center gap-(--space-2)">
              <ProjectStatusChip status={row.status} />
              {props.renderMenu(row)}
            </span>
          }
        />
      ))}
    </ul>
  );
}

function ViewAllLink({
  workspaceId,
  q,
  filter,
}: Readonly<Pick<DashboardProjectsTableProps, "workspaceId" | "q" | "filter">>) {
  const t = useTranslations(DASHBOARD_OVERVIEW_COPY_NAMESPACE);
  const href = listUrlAt(projectTabPath(workspaceId, "ACTIVE"), q, filter);
  return (
    <Link href={href} className="block">
      <Button variant="secondary" className="w-full">
        {t("footerLink")}
      </Button>
    </Link>
  );
}
