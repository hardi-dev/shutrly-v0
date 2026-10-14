"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useState } from "react";

import type { ProjectListRow } from "@/features/booking/application/ports/project-list-reader/project-list-reader.port";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { ProjectFilterButton } from "../project-filter-button/project-filter-button";
import { ProjectFilterDialog } from "../project-filter-dialog/project-filter-dialog";
import { ProjectList } from "../project-list/project-list";
import { ProjectMenuHost } from "../project-menu-host/project-menu-host";
import { rowTarget } from "../project-menu-host/project-row-target";
import { ProjectSearchField } from "../project-search-field/project-search-field";
import { projectTabPath } from "../project-search-field/project-tab-path";
import { ProjectsEmptyState } from "../projects-empty-state/projects-empty-state";
import { ProjectsTable } from "../projects-table/projects-table";
import { ProjectsTabsBar } from "../projects-tabs-bar/projects-tabs-bar";
import { useLoadMoreProjects } from "../use-load-more-projects/use-load-more-projects";
import { NewProjectButton } from "./new-project-button";
import { PROJECTS_SCREEN_COPY_NAMESPACE } from "./projects-screen.copy";
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
  const t = useTranslations(PROJECTS_SCREEN_COPY_NAMESPACE);
  const locale = useFormattingLocale();
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
          const renderMenu = (row: ProjectListRow) => api.menuFor(rowTarget(t, row, locale));
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
  const t = useTranslations(PROJECTS_SCREEN_COPY_NAMESPACE);
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
          action={newButton(t("listAddMobile"))}
        />
      </>
    );
  }
  return (
    <>
      <PageActions>{newButton(t("listAddDesktop"))}</PageActions>
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
  const t = useTranslations(PROJECTS_SCREEN_COPY_NAMESPACE);
  return (
    <ProjectsEmptyState
      tab={tab}
      hasQuery={q !== ""}
      action={
        q === "" ? (
          <NewProjectButton workspaceId={workspaceId} label={t("listAddDesktop")} />
        ) : (
          <Link href={projectTabPath(workspaceId, tab)} className="font-semibold underline">
            {t("clearSearch")}
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
  const t = useTranslations(PROJECTS_SCREEN_COPY_NAMESPACE);
  const handlePress = () => {
    void onLoadMore();
  };
  return (
    <Button variant="secondary" isPending={isLoading} onPress={handlePress}>
      {isLoading ? t("loadingMore") : t("loadMore")}
    </Button>
  );
}
