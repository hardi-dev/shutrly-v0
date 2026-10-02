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
import type { ClientsScreenProps } from "./clients-screen.types";

/** Chooses the responsive client-list composition for the active route status. */
export function ClientsScreen({
  workspaceId,
  status,
  count,
  rows,
  addAction,
}: Readonly<ClientsScreenProps>) {
  const isMobile = useMobileViewport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  function openDialog(): void {
    setIsDialogOpen(true);
  }
  const desktopAddAction = addAction ? (
    <Button iconLeading="plus" onPress={openDialog}>
      {CLIENT_COPY.addClient}
    </Button>
  ) : null;
  const mobileAddAction = addAction ? (
    <Button variant="secondary" iconLeading="plus" onPress={openDialog}>
      {CLIENT_COPY.add}
    </Button>
  ) : null;
  const emptyState = (
    <ClientsEmptyState status={status} action={isMobile ? mobileAddAction : undefined} />
  );
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
        <ClientsTable status={status} count={count} rows={rows} emptyState={emptyState} />
      )}
      <ClientAddDialog
        addAction={addAction}
        isDialogOpen={isDialogOpen}
        workspaceId={workspaceId}
        onOpenChange={setIsDialogOpen}
      />
    </main>
  );
}

function ClientAddDialog({
  addAction,
  isDialogOpen,
  workspaceId,
  onOpenChange,
}: Readonly<{
  readonly addAction: ClientsScreenProps["addAction"];
  readonly isDialogOpen: boolean;
  readonly workspaceId: string;
  readonly onOpenChange: (isOpen: boolean) => void;
}>) {
  const mutations = useClientMutations();
  if (!addAction) return null;
  const submitAction = addAction;
  function submitClient(id: string, values: Parameters<NonNullable<ClientsScreenProps["addAction"]>>[1]) {
    return mutations.run(values.name, () => submitAction(id, values));
  }
  return (
    <ClientDialog
      isOpen={isDialogOpen}
      workspaceId={workspaceId}
      onOpenChange={onOpenChange}
      onSubmit={submitClient}
    />
  );
}
