"use client";

import Link from "next/link";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { ProjectList } from "../project-list/project-list";
import { ProjectSearchField } from "../project-search-field/project-search-field";
import { projectTabPath } from "../project-search-field/project-tab-path";
import { ProjectsEmptyState } from "../projects-empty-state/projects-empty-state";
import { ProjectsTable } from "../projects-table/projects-table";
import { ProjectsTabsBar } from "../projects-tabs-bar/projects-tabs-bar";
import { useLoadMoreProjects } from "../use-load-more-projects/use-load-more-projects";
import { NewProjectButton } from "./new-project-button";
import type { ProjectsScreenProps } from "./projects-screen.types";

/** The project list (S1): tabs, search, table or list card, and Muat lebih banyak (AC-PRJ-001…005). */
export function ProjectsScreen(props: Readonly<ProjectsScreenProps>) {
  const pager = useLoadMoreProjects({
    workspaceId: props.workspaceId,
    tab: props.tab,
    q: props.q,
    initial: props.initialPage,
    action: props.loadMoreAction,
  });
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)">
      <ProjectsBody {...props} rows={pager.rows} />
      {pager.hasMore ? <LoadMore isLoading={pager.isLoading} onLoadMore={pager.loadMore} /> : null}
    </main>
  );
}

function ProjectsBody(
  props: Readonly<ProjectsScreenProps & { rows: ProjectsScreenProps["initialPage"]["items"] }>,
) {
  const isMobile = useMobileViewport();
  const newButton = (label: string) => (
    <NewProjectButton workspaceId={props.workspaceId} label={label} />
  );
  const search = (
    <ProjectSearchField
      workspaceId={props.workspaceId}
      tab={props.tab}
      q={props.q}
      resultCount={props.rows.length}
    />
  );
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
      />
    </>
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
