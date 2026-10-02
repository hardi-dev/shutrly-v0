"use client";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { PageActions } from "@/ui/patterns/page-actions/page-actions";
import { Button } from "@/ui/primitives/button/button";

import { ClientList } from "../client-list/client-list";
import { ClientsEmptyState } from "../clients-empty-state/clients-empty-state";
import { ClientsTable } from "../clients-table/clients-table";
import { ClientsTabsBar } from "../clients-tabs-bar/clients-tabs-bar";
import type { ClientsScreenProps } from "./clients-screen.types";

/** Chooses the responsive client-list composition for the active route status. */
export function ClientsScreen({
  workspaceId,
  status,
  count,
  rows,
  onAdd,
}: Readonly<ClientsScreenProps>) {
  const isMobile = useMobileViewport();
  const desktopAddAction = onAdd ? (
    <Button iconLeading="plus" onPress={onAdd}>
      {CLIENT_COPY.addClient}
    </Button>
  ) : null;
  const mobileAddAction = onAdd ? (
    <Button variant="secondary" iconLeading="plus" onPress={onAdd}>
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
    </main>
  );
}
import { CLIENT_COPY } from "../client-copy/client-copy.copy";
