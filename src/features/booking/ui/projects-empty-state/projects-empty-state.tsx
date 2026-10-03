import type { ReactNode } from "react";

import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

const EMPTY = {
  ACTIVE: { title: PROJECT_COPY.emptyActiveTitle, body: PROJECT_COPY.emptyActiveBody },
  COMPLETED: { title: PROJECT_COPY.emptyCompletedTitle, body: PROJECT_COPY.emptyCompletedBody },
  CANCELLED: { title: PROJECT_COPY.emptyCancelledTitle, body: PROJECT_COPY.emptyCancelledBody },
} as const;

/** The in-card empty state of a tab, or the no-match state while a search is active. */
export function ProjectsEmptyState({
  tab,
  hasQuery,
  action,
}: Readonly<{ tab: ProjectTab; hasQuery: boolean; action?: ReactNode }>) {
  if (hasQuery) {
    return (
      <EmptyState
        placement="in-card"
        icon="search-x"
        title={PROJECT_COPY.noMatchTitle}
        body={PROJECT_COPY.noMatchBody}
        action={action}
      />
    );
  }
  return (
    <EmptyState
      placement="in-card"
      icon="folder-kanban"
      title={EMPTY[tab].title}
      body={EMPTY[tab].body}
      action={tab === "ACTIVE" ? action : undefined}
    />
  );
}
