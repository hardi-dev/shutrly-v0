"use client";

import { activeFilterGroupCount } from "@/features/booking/domain/project-list-query/project-list-filter";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";

/** The filter button beside the search, with a red count of the active filter groups (A-11). */
export function ProjectFilterButton({
  tab,
  filter,
  onPress,
}: Readonly<{ tab: ProjectTab; filter: ProjectFilter; onPress: () => void }>) {
  return (
    <IconButton
      icon="list-filter"
      aria-label={PROJECT_COPY.filterButton}
      badgeCount={activeFilterGroupCount(filter, tab)}
      badgeLabel={PROJECT_COPY.filterBadgeLabel}
      onPress={onPress}
    />
  );
}
