"use client";

import { useState } from "react";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { ClientDialog } from "../client-dialog/client-dialog";
import { ClientList } from "../client-list/client-list";
import { ClientsEmptyState } from "../clients-empty-state/clients-empty-state";
import { ClientsTable } from "../clients-table/clients-table";
import { ClientsTabsBar } from "../clients-tabs-bar/clients-tabs-bar";
import { useClientMutations } from "../use-client-mutations/use-client-mutations";
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
  addAction,
  updateAction,
}: Readonly<ClientsScreenProps>) {
  const isMobile = useMobileViewport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ClientsScreenProps["rows"][number] | undefined>();
  function openDialog(): void {
    setEditing(undefined);
    setIsDialogOpen(true);
  }
  function openEdit(client: ClientsScreenProps["rows"][number]): void {
    setEditing(client);
    setIsDialogOpen(true);
  }
  const actions = createAddActions(addAction, openDialog);
  const emptyState = (
    <ClientsEmptyState status={status} action={isMobile ? actions.mobile : undefined} />
  );
  return (
    <ClientScreenContent
      workspaceId={workspaceId}
      status={status}
      count={count}
      rows={rows}
      isMobile={isMobile}
      desktopAddAction={actions.desktop}
      mobileAddAction={actions.mobile}
      emptyState={emptyState}
      updateAction={updateAction}
      openEdit={openEdit}
      addAction={addAction}
      isDialogOpen={isDialogOpen}
      editing={editing}
      onOpenChange={setIsDialogOpen}
    />
  );
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
  updateAction,
  openEdit,
  addAction,
  isDialogOpen,
  editing,
  onOpenChange,
}: Readonly<ClientScreenContentProps>) {
  return (
    <main className="mx-auto flex w-full max-w-(--size-content-narrow) flex-col gap-(--space-4) md:gap-(--component-panel-app-content-gap)">
      <PageActions>{desktopAddAction}</PageActions>
      {isMobile ? <ClientsTabsBar workspaceId={workspaceId} status={status} /> : null}
      {isMobile ? (
        <ClientList
          status={status}
          count={count}
          rows={rows}
          action={mobileAddAction}
          emptyState={emptyState}
        />
      ) : (
        <ClientsTable
          status={status}
          count={count}
          rows={rows}
          emptyState={emptyState}
          onRowAction={updateAction ? openEdit : undefined}
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
    </main>
  );
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
      return mutations.run(values.name, () => updateAction(id, editing.id, values));
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
