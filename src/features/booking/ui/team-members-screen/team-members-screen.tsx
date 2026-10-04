"use client";

import { useRouter } from "next/navigation";

import type { TeamMemberRecord } from "@/features/booking/application/ports/team-member-repository/team-member-repository.port";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { DeleteTeamMemberDialog } from "../delete-team-member-dialog/delete-team-member-dialog";
import { TEAM_COPY } from "../team-copy/team-copy.copy";
import { TeamMemberDialog } from "../team-member-dialog/team-member-dialog";
import { TeamMemberList } from "../team-member-list/team-member-list";
import { TeamMemberRowActions } from "../team-member-row-actions/team-member-row-actions";
import { TeamMemberSearchField } from "../team-member-search-field/team-member-search-field";
import { TeamMembersEmptyState } from "../team-members-empty-state/team-members-empty-state";
import { TeamMembersTable } from "../team-members-table/team-members-table";
import { TeamTabsBar } from "../team-tabs-bar/team-tabs-bar";
import { useLoadMoreTeamMembers } from "../use-load-more-team-members/use-load-more-team-members";
import type {
  LoadMoreButtonProps,
  MemberDialogsProps,
  MembersBodyProps,
  TeamMembersScreenProps,
} from "./team-members-screen.types";
import { useMemberArchive } from "./use-member-archive";
import { useMemberDialog } from "./use-member-dialog";

/**
 * The *Tim › Anggota* screen for one tab (*Aktif* or *Arsip*): the searchable member list, its
 * row menu and the add / edit / delete dialogs.
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
        onDelete={dialog.openDelete}
      />
      {pager.hasMore ? (
        <LoadMoreButton isLoading={pager.isLoading} onLoadMore={pager.loadMore} />
      ) : null}
      <MemberDialogs {...props} dialog={dialog} />
    </main>
  );
}

function MemberDialogs({ dialog, ...props }: Readonly<MemberDialogsProps>) {
  return (
    <>
      <TeamMemberDialog
        key={dialog.member?.id ?? "new-member"}
        isOpen={dialog.isOpen}
        workspaceId={props.workspaceId}
        onOpenChange={dialog.setIsOpen}
        member={dialog.member}
        roles={props.roles}
        addAction={props.addAction}
        updateAction={props.updateAction}
        addRoleAction={props.addRoleAction}
      />
      <DeleteTeamMemberDialog
        member={dialog.deleting}
        workspaceId={props.workspaceId}
        onOpenChange={dialog.closeDelete}
        action={props.deleteAction}
      />
    </>
  );
}

function MembersBody(props: Readonly<MembersBodyProps>) {
  const { workspaceId, status, count, q, isMobile, rows, addButton } = props;
  const search = (
    <TeamMemberSearchField
      workspaceId={workspaceId}
      status={status}
      q={q}
      resultCount={rows.length}
    />
  );
  function renderActions(member: TeamMemberRecord) {
    return <MemberRowMenu {...props} member={member} />;
  }
  const emptyState = <MembersEmpty {...props} />;
  const list = { status, count, rows, emptyState, onEdit: props.onEdit, renderActions };
  if (!isMobile) return <TeamMembersTable {...list} search={search} />;
  return (
    <>
      {search}
      <TeamMemberList {...list} action={addButton} />
    </>
  );
}

function MemberRowMenu({
  member,
  workspaceId,
  setArchivedAction,
  onEdit,
  onDelete,
}: Readonly<MembersBodyProps & { member: TeamMemberRecord }>) {
  const archive = useMemberArchive(workspaceId, setArchivedAction);
  return (
    <TeamMemberRowActions
      member={member}
      onEdit={onEdit}
      onArchive={archive.archive}
      onRestore={archive.restore}
      onDelete={onDelete}
    />
  );
}

function MembersEmpty({ workspaceId, status, q, isMobile, onAdd }: Readonly<MembersBodyProps>) {
  const router = useRouter();
  function handleClearSearch(): void {
    router.replace(`/w/${workspaceId}/team${status === "ARCHIVED" ? "/archived" : ""}`);
  }
  return (
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
