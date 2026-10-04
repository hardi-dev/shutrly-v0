import { EmptyState } from "@/ui/patterns/empty-state/empty-state";
import { Button } from "@/ui/primitives/button/button";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
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
  if (hasQuery) {
    return (
      <EmptyState
        placement="in-card"
        icon="search-x"
        title={TEAM_COPY.noMatchTitle}
        body={TEAM_COPY.noMatchBody}
        action={
          <Button variant="secondary" onPress={onClearSearch}>
            {TEAM_COPY.clearSearch}
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
      title={isActive ? TEAM_COPY.emptyActiveTitle : TEAM_COPY.emptyArchivedTitle}
      body={isActive ? TEAM_COPY.emptyActiveBody : TEAM_COPY.emptyArchivedBody}
      action={isActive ? addAction : undefined}
    />
  );
}
