"use client";
/* eslint-disable max-len, no-restricted-syntax, @typescript-eslint/no-confusing-void-expression, max-lines-per-function -- responsive list wiring shares the archive mutation */

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { showToast } from "@/ui/patterns/toast/toast";
import { Button } from "@/ui/primitives/button/button";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { ClientDialog } from "../client-dialog/client-dialog";
import { ClientList } from "../client-list/client-list";
import { ClientSearchField } from "../client-search-field/client-search-field";
import { ClientsEmptyState } from "../clients-empty-state/clients-empty-state";
import { ClientsTable } from "../clients-table/clients-table";
import { ClientsTabsBar } from "../clients-tabs-bar/clients-tabs-bar";
import { DeleteClientDialog } from "../delete-client-dialog/delete-client-dialog";
import { useClientMutations } from "../use-client-mutations/use-client-mutations";
import { useLoadMoreClients } from "../use-load-more-clients/use-load-more-clients";
import type {
  ClientAddDialogProps,
  ClientScreenContentProps,
  ClientsScreenProps,
} from "./clients-screen.types";

/** Chooses the responsive client-list composition for the active route status. */
export function ClientsScreen({
  workspaceId,
  status,
  count,
  rows,
  q = "",
  initialPage,
  loadMoreAction,
  addAction,
  updateAction,
  setArchivedAction,
  deleteAction,
}: Readonly<ClientsScreenProps>) {
  const isMobile = useMobileViewport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClientsScreenProps["rows"][number] | undefined>();
  const [deleting, setDeleting] = useState<ClientsScreenProps["rows"][number] | null>(null);
  const pager = useClientPager(workspaceId, status, q, rows, initialPage, loadMoreAction);
  const search = (
    <ClientSearchField workspaceId={workspaceId} status={status} q={q} resultCount={pager.rows.length} />
  );
  function openDialog(): void {
    setEditing(undefined);
    setIsDialogOpen(true);
  }
  function openEdit(client: ClientsScreenProps["rows"][number]): void {
    setEditing(client);
    setIsDialogOpen(true);
  }
  function closeDeleteDialog(isOpen: boolean): void {
    if (!isOpen) setDeleting(null);
  }
  const actions = createAddActions(addAction, openDialog);
  const emptyState = q ? (
    <EmptyState
      placement="in-card"
      icon="search-x"
      title={CLIENT_COPY.noMatchTitle}
      body={CLIENT_COPY.noMatchBody}
    />
  ) : (
    <ClientsEmptyState status={status} action={isMobile ? actions.mobile : undefined} />
  );
  return (
    <>
      <ClientScreenContent
      workspaceId={workspaceId}
      status={status}
      count={count}
      rows={pager.rows}
      isMobile={isMobile}
      desktopAddAction={actions.desktop}
      mobileAddAction={actions.mobile}
      emptyState={emptyState}
      footer={pager.hasMore ? <LoadMoreButton isLoading={pager.isLoading} onLoadMore={pager.loadMore} /> : null}
      search={search}
      updateAction={updateAction}
      openEdit={openEdit}
      addAction={addAction}
      isDialogOpen={isDialogOpen}
      editing={editing}
      onOpenChange={setIsDialogOpen}
      setArchivedAction={setArchivedAction}
      deleteAction={deleteAction}
      openDelete={setDeleting}
      />
      {deleteAction ? (
        <DeleteClientDialog
          client={deleting}
          workspaceId={workspaceId}
          action={deleteAction}
          onOpenChange={closeDeleteDialog}
        />
      ) : null}
    </>
  );
}

function LoadMoreButton({ isLoading, onLoadMore }: Readonly<{ isLoading: boolean; onLoadMore: () => Promise<void> }>) {
  function handleLoadMore(): void { void onLoadMore(); }
  return <Button variant="secondary" isPending={isLoading} onPress={handleLoadMore}>{isLoading ? CLIENT_COPY.loadingMore : CLIENT_COPY.loadMore}</Button>;
}

function useClientPager(
  workspaceId: string,
  status: ClientsScreenProps["status"],
  q: string,
  rows: ClientsScreenProps["rows"],
  initialPage: ClientsScreenProps["initialPage"],
  action: ClientsScreenProps["loadMoreAction"],
) {
  const fallback = initialPage ?? { items: rows, nextCursor: null };
  return useLoadMoreClients({ workspaceId, status, q, initial: fallback, action });
}

function ClientScreenContent({
  workspaceId,
  status,
  count,
  rows,
  isMobile,
  desktopAddAction,
  mobileAddAction,
  emptyState,
  footer,
  search,
  updateAction,
  openEdit,
  addAction,
  isDialogOpen,
  editing,
  onOpenChange,
  setArchivedAction,
  openDelete,
}: Readonly<ClientScreenContentProps>) {
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)">
      <PageActions>{desktopAddAction}</PageActions>
      {isMobile ? <ClientsTabsBar workspaceId={workspaceId} status={status} /> : null}
      {isMobile ? search : null}
      {isMobile ? (
        <ClientList
          status={status}
          count={count}
          rows={rows}
          action={mobileAddAction}
          emptyState={emptyState}
          onEdit={openEdit}
          onArchive={(client) => archiveClient(client, true, setArchivedAction, workspaceId)}
          onRestore={(client) => archiveClient(client, false, setArchivedAction, workspaceId)}
          onDelete={openDelete}
        />
      ) : (
        <ClientsTable
          status={status}
          count={count}
          rows={rows}
          emptyState={emptyState}
          search={search}
          onRowAction={updateAction ? openEdit : undefined}
          onArchive={(client) => archiveClient(client, true, setArchivedAction, workspaceId)}
          onRestore={(client) => archiveClient(client, false, setArchivedAction, workspaceId)}
          onDelete={openDelete}
        />
      )}
      <ClientAddDialog
        addAction={addAction}
        updateAction={updateAction}
        isDialogOpen={isDialogOpen}
        editing={editing}
        workspaceId={workspaceId}
        onOpenChange={onOpenChange}
      />
      {footer}
    </main>
  );
}

function archiveClient(
  client: ClientsScreenProps["rows"][number],
  isArchived: boolean,
  action: ClientsScreenProps["setArchivedAction"],
  workspaceId: string,
): void {
  if (!action) return;
  void action(workspaceId, client.id, isArchived).then(() => {
    showToast({
      tone: "success",
      title: isArchived ? CLIENT_COPY.archivedTitle : CLIENT_COPY.restoredTitle,
      body: isArchived ? CLIENT_COPY.archivedBody(client.name) : undefined,
      action: isArchived
        ? { label: CLIENT_COPY.undo, onAction: () => archiveClient(client, false, action, workspaceId) }
        : undefined,
    });
  });
}

function ClientAddDialog({
  addAction,
  updateAction,
  isDialogOpen,
  editing,
  workspaceId,
  onOpenChange,
}: Readonly<ClientAddDialogProps>) {
  const mutations = useClientMutations();
  if (!addAction && !updateAction) return null;
  function submitClient(
    id: string,
    values: Parameters<NonNullable<ClientsScreenProps["addAction"]>>[1],
  ) {
    if (editing && updateAction)
      return mutations.run(values.name, () => updateAction(id, editing.id, values), {
        title: CLIENT_COPY.savedTitle,
      });
    if (addAction) return mutations.run(values.name, () => addAction(id, values));
    return Promise.resolve({ ok: true } as const);
  }
  return (
    <ClientDialog
      isOpen={isDialogOpen}
      workspaceId={workspaceId}
      onOpenChange={onOpenChange}
      onSubmit={submitClient}
      mode={editing ? "edit" : "add"}
      client={editing}
    />
  );
}

function createAddActions(addAction: ClientsScreenProps["addAction"], onAdd: () => void) {
  if (!addAction) return { desktop: null, mobile: null };
  return {
    desktop: (
      <Button iconLeading="plus" onPress={onAdd}>
        {CLIENT_COPY.addClient}
      </Button>
    ),
    mobile: (
      <Button variant="secondary" iconLeading="plus" onPress={onAdd}>
        {CLIENT_COPY.add}
      </Button>
    ),
  };
}
/* eslint-enable max-len, no-restricted-syntax, @typescript-eslint/no-confusing-void-expression, max-lines-per-function -- end responsive archive wiring */
