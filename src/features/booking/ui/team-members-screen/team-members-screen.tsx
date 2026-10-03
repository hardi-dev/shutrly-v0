"use client";

import { useRouter } from "next/navigation";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { Button } from "@/ui/primitives/button/button";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { TeamMemberList } from "../team-member-list/team-member-list";
import { TeamMemberSearchField } from "../team-member-search-field/team-member-search-field";
import { TeamMembersEmptyState } from "../team-members-empty-state/team-members-empty-state";
import { TeamMembersTable } from "../team-members-table/team-members-table";
import { TeamTabsBar } from "../team-tabs-bar/team-tabs-bar";
import { useLoadMoreTeamMembers } from "../use-load-more-team-members/use-load-more-team-members";
import type { LoadMoreButtonProps, TeamMembersScreenProps } from "./team-members-screen.types";

/**
 * The *Tim › Anggota* screen for one tab (*Aktif* or *Arsip*): the searchable member list.
 * @param props - the tab, its first page, the count and the load-more action
 * @returns the responsive screen
 */
export function TeamMembersScreen({
  workspaceId,
  status,
  count,
  q,
  initialPage,
  loadMoreAction,
}: Readonly<TeamMembersScreenProps>) {
  const isMobile = useMobileViewport();
  const router = useRouter();
  const pager = useLoadMoreTeamMembers({
    workspaceId,
    status,
    q,
    initial: initialPage,
    action: loadMoreAction,
  });
  function handleClearSearch(): void {
    router.replace(`/w/${workspaceId}/team${status === "ARCHIVED" ? "/archived" : ""}`);
  }
  const search = (
    <TeamMemberSearchField
      workspaceId={workspaceId}
      status={status}
      q={q}
      resultCount={pager.rows.length}
    />
  );
  const emptyState = (
    <TeamMembersEmptyState status={status} hasQuery={q !== ""} onClearSearch={handleClearSearch} />
  );
  const list = { status, count, rows: pager.rows, emptyState };
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)">
      <TeamTabsBar workspaceId={workspaceId} tab={status} />
      {isMobile ? search : null}
      {isMobile ? <TeamMemberList {...list} /> : <TeamMembersTable {...list} search={search} />}
      {pager.hasMore ? (
        <LoadMoreButton isLoading={pager.isLoading} onLoadMore={pager.loadMore} />
      ) : null}
    </main>
  );
}

function LoadMoreButton({ isLoading, onLoadMore }: Readonly<LoadMoreButtonProps>) {
  function handlePress(): void {
    void onLoadMore();
  }
  return (
    <Button variant="secondary" isPending={isLoading} onPress={handlePress}>
      {isLoading ? TEAM_COPY.loadingMore : TEAM_COPY.loadMore}
    </Button>
  );
}
