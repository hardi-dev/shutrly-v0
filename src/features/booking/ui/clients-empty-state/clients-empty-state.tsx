import { EmptyState } from "@/ui/patterns/empty-state/empty-state";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import type { ClientsEmptyStateProps } from "./clients-empty-state.types";

/** Renders the external empty state for the selected client status. */
export function ClientsEmptyState({ status, action }: Readonly<ClientsEmptyStateProps>) {
  const isActive = status === "ACTIVE";
  return (
    <EmptyState
      placement="in-card"
      icon={isActive ? "users" : "archive"}
      title={isActive ? CLIENT_COPY.emptyActiveTitle : CLIENT_COPY.emptyArchivedTitle}
      body={isActive ? CLIENT_COPY.emptyActiveBody : CLIENT_COPY.emptyArchivedBody}
      action={action}
    />
  );
}
