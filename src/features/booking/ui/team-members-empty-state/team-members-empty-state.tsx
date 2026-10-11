import { useTranslations } from "next-intl";

import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { Button } from "@/ui/primitives/button/button";

import { TEAM_MEMBERS_EMPTY_STATE_COPY_NAMESPACE } from "./team-members-empty-state.copy";
import type { TeamMembersEmptyStateProps } from "./team-members-empty-state.types";

/**
 * The in-card empty state of a member tab: nothing yet, nothing archived, or no search match.
 * @param props - the tab, whether a search is active and the actions
 * @returns the empty state
 */
export function TeamMembersEmptyState({
  status,
  hasQuery,
  addAction,
  onClearSearch,
}: Readonly<TeamMembersEmptyStateProps>) {
  const t = useTranslations(TEAM_MEMBERS_EMPTY_STATE_COPY_NAMESPACE);
  if (hasQuery) {
    return (
      <EmptyState
        placement="in-card"
        icon="search-x"
        title={t("noMatchTitle")}
        body={t("noMatchBody")}
        action={
          <Button variant="secondary" onPress={onClearSearch}>
            {t("clearSearch")}
          </Button>
        }
      />
    );
  }
  const isActive = status === "ACTIVE";
  return (
    <EmptyState
      placement="in-card"
      icon={isActive ? "users" : "archive"}
      title={isActive ? t("emptyActiveTitle") : t("emptyArchivedTitle")}
      body={isActive ? t("emptyActiveBody") : t("emptyArchivedBody")}
      action={isActive ? addAction : undefined}
    />
  );
}
