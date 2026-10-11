import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { EmptyState } from "@/ui/patterns/empty-state/empty-state";

import { PROJECTS_EMPTY_STATE_COPY_NAMESPACE } from "./projects-empty-state.copy";

const EMPTY_KEY = {
  ACTIVE: { title: "emptyActiveTitle", body: "emptyActiveBody" },
  COMPLETED: { title: "emptyCompletedTitle", body: "emptyCompletedBody" },
  CANCELLED: { title: "emptyCancelledTitle", body: "emptyCancelledBody" },
} as const;

/** The in-card empty state of a tab, or the no-match state while a search is active. */
export function ProjectsEmptyState({
  tab,
  hasQuery,
  action,
}: Readonly<{ tab: ProjectTab; hasQuery: boolean; action?: ReactNode }>) {
  const t = useTranslations(PROJECTS_EMPTY_STATE_COPY_NAMESPACE);
  if (hasQuery) {
    return (
      <EmptyState
        placement="in-card"
        icon="search-x"
        title={t("noMatchTitle")}
        body={t("noMatchBody")}
        action={action}
      />
    );
  }
  return (
    <EmptyState
      placement="in-card"
      icon="folder-kanban"
      title={t(EMPTY_KEY[tab].title)}
      body={t(EMPTY_KEY[tab].body)}
      action={tab === "ACTIVE" ? action : undefined}
    />
  );
}
