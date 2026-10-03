"use client";

import { useRouter } from "next/navigation";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { TeamMemberDialog } from "../team-member-dialog/team-member-dialog";
import { TeamMemberList } from "../team-member-list/team-member-list";
import { TeamMemberSearchField } from "../team-member-search-field/team-member-search-field";
import { TeamMembersEmptyState } from "../team-members-empty-state/team-members-empty-state";
import { TeamMembersTable } from "../team-members-table/team-members-table";
import { TeamTabsBar } from "../team-tabs-bar/team-tabs-bar";
import { useLoadMoreTeamMembers } from "../use-load-more-team-members/use-load-more-team-members";
import type {
  LoadMoreButtonProps,
  MembersBodyProps,
  TeamMembersScreenProps,
} from "./team-members-screen.types";
import { useMemberDialog } from "./use-member-dialog";

/**
 * The *Tim › Anggota* screen for one tab (*Aktif* or *Arsip*): the searchable member list and the
 * add / edit dialog.
 * @param props - the tab, its first page, the count, the roles and the server actions
 * @returns the responsive screen
 */
export function TeamMembersScreen(props: Readonly<TeamMembersScreenProps>) {
  const { workspaceId, status, q } = props;
  const isMobile = useMobileViewport();
  const dialog = useMemberDialog();
  const pager = useLoadMoreTeamMembers({
    workspaceId,
    status,
    q,
    initial: props.initialPage,
    action: props.loadMoreAction,
  });
  const addButton = (
    <Button iconLeading="plus" onPress={dialog.openAdd}>
      {isMobile ? TEAM_COPY.addMemberShort : TEAM_COPY.addMember}
    </Button>
  );
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)">
      <PageActions>{addButton}</PageActions>
      <TeamTabsBar workspaceId={workspaceId} tab={status} />
      <MembersBody
        {...props}
        isMobile={isMobile}
        rows={pager.rows}
        addButton={addButton}
        onAdd={dialog.openAdd}
        onEdit={dialog.openEdit}
      />
      {pager.hasMore ? (
        <LoadMoreButton isLoading={pager.isLoading} onLoadMore={pager.loadMore} />
      ) : null}
      <TeamMemberDialog
        key={dialog.member?.id ?? "new-member"}
        isOpen={dialog.isOpen}
        workspaceId={workspaceId}
        onOpenChange={dialog.setIsOpen}
        member={dialog.member}
        roles={props.roles}
        addAction={props.addAction}
        updateAction={props.updateAction}
        addRoleAction={props.addRoleAction}
      />
    </main>
  );
}

function MembersBody({
  workspaceId,
  status,
  count,
  q,
  isMobile,
  rows,
  addButton,
  onAdd,
  onEdit,
}: Readonly<MembersBodyProps>) {
  const router = useRouter();
  function handleClearSearch(): void {
    router.replace(`/w/${workspaceId}/team${status === "ARCHIVED" ? "/archived" : ""}`);
  }
  const search = (
    <TeamMemberSearchField
      workspaceId={workspaceId}
      status={status}
      q={q}
      resultCount={rows.length}
    />
  );
  const emptyState = (
    <TeamMembersEmptyState
      status={status}
      hasQuery={q !== ""}
      addAction={
        isMobile ? (
          <Button iconLeading="plus" onPress={onAdd}>
            {TEAM_COPY.addMember}
          </Button>
        ) : undefined
      }
      onClearSearch={handleClearSearch}
    />
  );
  const list = { status, count, rows, emptyState, onEdit };
  if (!isMobile) return <TeamMembersTable {...list} search={search} />;
  return (
    <>
      {search}
      <TeamMemberList {...list} action={addButton} />
    </>
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
