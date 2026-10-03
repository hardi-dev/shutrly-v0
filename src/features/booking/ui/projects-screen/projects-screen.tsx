"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useState } from "react";

import type { ProjectListRow } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import { formatShortDate } from "@/features/booking/domain/session/session";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { ProjectFilterButton } from "../project-filter-button/project-filter-button";
import { ProjectFilterDialog } from "../project-filter-dialog/project-filter-dialog";
import { ProjectList } from "../project-list/project-list";
import { ProjectMenuHost } from "../project-menu-host/project-menu-host";
import type { ProjectMenuTarget } from "../project-menu-host/project-menu-host.types";
import { ProjectSearchField } from "../project-search-field/project-search-field";
import { projectTabPath } from "../project-search-field/project-tab-path";
import { projectStatusChip } from "../project-status-chip/project-status-props";
import { ProjectsEmptyState } from "../projects-empty-state/projects-empty-state";
import { ProjectsTable } from "../projects-table/projects-table";
import { ProjectsTabsBar } from "../projects-tabs-bar/projects-tabs-bar";
import { useLoadMoreProjects } from "../use-load-more-projects/use-load-more-projects";
import { NewProjectButton } from "./new-project-button";
import type { ProjectsScreenProps } from "./projects-screen.types";

function usePager(props: Readonly<ProjectsScreenProps>) {
  return useLoadMoreProjects({
    workspaceId: props.workspaceId,
    tab: props.tab,
    q: props.q,
    initial: props.initialPage,
    filter: props.filter,
    action: props.loadMoreAction,
  });
}

/** The project list (S1): tabs, search, table or list card, and Muat lebih banyak (AC-PRJ-001…005). */
export function ProjectsScreen(props: Readonly<ProjectsScreenProps>) {
  const pager = usePager(props);
  const router = useRouter();
  const handleDeleted = () => {
    router.refresh();
  };
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const handleOpenFilter = () => {
    setIsFilterOpen(true);
  };
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)">
      <ProjectMenuHost
        workspaceId={props.workspaceId}
        actions={props.menuActions}
        variant="row"
        onDeleted={handleDeleted}
      >
        {(api) => {
          const renderMenu = (row: ProjectListRow) => api.menuFor(rowTarget(row));
          return (
            <ProjectsBody
              {...props}
              rows={pager.rows}
              onOpenFilter={handleOpenFilter}
              renderMenu={renderMenu}
            />
          );
        }}
      </ProjectMenuHost>
      <ProjectFilterDialog
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        workspaceId={props.workspaceId}
        tab={props.tab}
        q={props.q}
        filter={props.filter}
        services={props.services}
        initialClient={props.filterClient}
        searchClientsAction={props.searchClientsAction}
      />
      {pager.hasMore ? <LoadMore isLoading={pager.isLoading} onLoadMore={pager.loadMore} /> : null}
    </main>
  );
}

function ProjectsBody(
  props: Readonly<
    ProjectsScreenProps & {
      rows: ProjectsScreenProps["initialPage"]["items"];
      onOpenFilter: () => void;
      renderMenu: (row: ProjectListRow) => ReactNode;
    }
  >,
) {
  const isMobile = useMobileViewport();
  const newButton = (label: string) => (
    <NewProjectButton workspaceId={props.workspaceId} label={label} />
  );
  const search = <ProjectsSearchRow {...props} />;
  const emptyState = <ProjectsEmpty workspaceId={props.workspaceId} tab={props.tab} q={props.q} />;
  if (isMobile) {
    return (
      <>
        <ProjectsTabsBar workspaceId={props.workspaceId} tab={props.tab} />
        {search}
        <ProjectList
          workspaceId={props.workspaceId}
          tab={props.tab}
          count={props.count}
          rows={props.rows}
          emptyState={emptyState}
          renderMenu={props.renderMenu}
          action={newButton(PROJECT_COPY.listAddMobile)}
        />
      </>
    );
  }
  return (
    <>
      <PageActions>{newButton(PROJECT_COPY.listAddDesktop)}</PageActions>
      <ProjectsTable
        workspaceId={props.workspaceId}
        tab={props.tab}
        count={props.count}
        rows={props.rows}
        emptyState={emptyState}
        search={search}
        renderMenu={props.renderMenu}
      />
    </>
  );
}

function rowTarget(row: ProjectListRow): ProjectMenuTarget {
  const when =
    row.shownSession === null
      ? PROJECT_COPY.metaNoSchedule
      : formatShortDate(row.shownSession.date);
  return {
    id: row.id,
    title: row.title,
    status: row.status,
    hasTeam: row.hasTeam,
    clientId: row.clientId,
    clientName: row.clientName,
    whatsappNumber: row.clientWhatsappNumber,
    meta: PROJECT_COPY.menuSheetMeta(row.clientName, when, projectStatusChip(row.status).label),
  };
}

function ProjectsSearchRow(
  props: Readonly<
    ProjectsScreenProps & {
      rows: ProjectsScreenProps["initialPage"]["items"];
      onOpenFilter: () => void;
    }
  >,
) {
  return (
    <div className="flex w-full items-center gap-(--space-2)">
      <ProjectSearchField
        workspaceId={props.workspaceId}
        tab={props.tab}
        q={props.q}
        filter={props.filter}
        resultCount={props.rows.length}
      />
      <ProjectFilterButton tab={props.tab} filter={props.filter} onPress={props.onOpenFilter} />
    </div>
  );
}

function ProjectsEmpty({
  workspaceId,
  tab,
  q,
}: Readonly<Pick<ProjectsScreenProps, "workspaceId" | "tab" | "q">>) {
  return (
    <ProjectsEmptyState
      tab={tab}
      hasQuery={q !== ""}
      action={
        q === "" ? (
          <NewProjectButton workspaceId={workspaceId} label={PROJECT_COPY.listAddDesktop} />
        ) : (
          <Link href={projectTabPath(workspaceId, tab)} className="font-semibold underline">
            {PROJECT_COPY.clearSearch}
          </Link>
        )
      }
    />
  );
}

function LoadMore({
  isLoading,
  onLoadMore,
}: Readonly<{ isLoading: boolean; onLoadMore: () => Promise<void> }>) {
  const handlePress = () => {
    void onLoadMore();
  };
  return (
    <Button variant="secondary" isPending={isLoading} onPress={handlePress}>
      {isLoading ? PROJECT_COPY.loadingMore : PROJECT_COPY.loadMore}
    </Button>
  );
}
