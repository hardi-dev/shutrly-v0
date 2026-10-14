"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import type { ActiveProjectRow } from "@/features/booking/application/ports/dashboard-overview-reader/dashboard-overview-reader.port";
import type { DashboardOverview } from "@/features/booking/application/use-cases/load-dashboard-overview/load-dashboard-overview.types";
import {
  activeFilterGroupCount,
  EMPTY_PROJECT_FILTER,
} from "@/features/booking/domain/project-list-query/project-list-filter";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";

import { ProjectFilterDialog } from "../project-filter-dialog/project-filter-dialog";
import { ProjectMenuHost } from "../project-menu-host/project-menu-host";
import type { ProjectMenuApi } from "../project-menu-host/project-menu-host.types";
import { rowTarget } from "../project-menu-host/project-row-target";
import { NewProjectButton } from "../projects-screen/new-project-button";
import { DashboardMetricTiles } from "./dashboard-metric-tiles";
import { DASHBOARD_PROJECT_COPY_NAMESPACE } from "./dashboard-overview.copy";
import type { DashboardOverviewProps } from "./dashboard-overview.types";
import { DashboardProjectsTable } from "./dashboard-projects-table";

/** The workspace dashboard overview (F-26): the header action *New project*, four metric tiles, and the *Active projects* table with the project list's search, filter and row menu. @param props - the workspace, the overview, the filter options and the menu actions @returns the overview */
export function DashboardOverview({
  workspaceId,
  overview,
  services,
  filterClient,
  menuActions,
  searchClientsAction,
}: Readonly<DashboardOverviewProps>) {
  const tp = useTranslations(DASHBOARD_PROJECT_COPY_NAMESPACE);
  const router = useRouter();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const handleDeleted = () => {
    router.refresh();
  };
  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };
  return (
    <div className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--component-panel-app-content-gap)">
      <PageActions>
        <NewProjectButton workspaceId={workspaceId} label={tp("listAddDesktop")} />
      </PageActions>
      <ProjectMenuHost
        workspaceId={workspaceId}
        actions={menuActions}
        variant="row"
        onDeleted={handleDeleted}
      >
        {(api) => (
          <OverviewContent
            workspaceId={workspaceId}
            overview={overview}
            menu={api}
            onOpenFilter={handleOpenFilter}
          />
        )}
      </ProjectMenuHost>
      <DashboardFilterDialog
        workspaceId={workspaceId}
        overview={overview}
        services={services}
        filterClient={filterClient}
        searchClientsAction={searchClientsAction}
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
      />
    </div>
  );
}

function DashboardFilterDialog({
  workspaceId,
  overview,
  services,
  filterClient,
  searchClientsAction,
  isOpen,
  onOpenChange,
}: Readonly<
  Pick<
    DashboardOverviewProps,
    "workspaceId" | "overview" | "services" | "filterClient" | "searchClientsAction"
  > & {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
  }
>) {
  return (
    <ProjectFilterDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      workspaceId={workspaceId}
      tab="ACTIVE"
      q={overview.table.search ?? ""}
      filter={overview.table.filter ?? EMPTY_PROJECT_FILTER}
      services={services}
      initialClient={filterClient}
      searchClientsAction={searchClientsAction}
      basePath={`/w/${workspaceId}`}
    />
  );
}

function OverviewContent({
  workspaceId,
  overview,
  menu,
  onOpenFilter,
}: Readonly<{
  workspaceId: string;
  overview: DashboardOverview;
  menu: ProjectMenuApi;
  onOpenFilter: () => void;
}>) {
  const tp = useTranslations(DASHBOARD_PROJECT_COPY_NAMESPACE);
  const locale = useFormattingLocale();
  const { tiles, today, table } = overview;
  const q = table.search ?? "";
  const filter = table.filter ?? EMPTY_PROJECT_FILTER;
  const hasQuery = q !== "" || activeFilterGroupCount(filter, "ACTIVE") > 0;
  const renderMenu = (row: ActiveProjectRow) => menu.menuFor(rowTarget(tp, row, locale));
  return (
    <>
      <DashboardMetricTiles tiles={tiles} />
      <DashboardProjectsTable
        workspaceId={workspaceId}
        rows={table.rows}
        total={table.total}
        q={q}
        filter={filter}
        today={today}
        hasQuery={hasQuery}
        onOpenFilter={onOpenFilter}
        renderMenu={renderMenu}
      />
    </>
  );
}
