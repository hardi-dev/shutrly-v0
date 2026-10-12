"use client";

import { useTranslations } from "next-intl";

import { activeFilterGroupCount } from "@/features/booking/domain/project-list-query/project-list-filter";
import type { ProjectFilter } from "@/features/booking/domain/project-list-query/project-list-filter.types";
import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { IconButton } from "@/ui/primitives/icon-button/icon-button";

import { PROJECT_FILTER_BUTTON_COPY_NAMESPACE } from "./project-filter-button.copy";

/** The filter button beside the search, with a red count of the active filter groups (A-11). */
export function ProjectFilterButton({
  tab,
  filter,
  onPress,
}: Readonly<{ tab: ProjectTab; filter: ProjectFilter; onPress: () => void }>) {
  const t = useTranslations(PROJECT_FILTER_BUTTON_COPY_NAMESPACE);
  const count = activeFilterGroupCount(filter, tab);
  return (
    <IconButton
      icon="list-filter"
      aria-label={t("filterButton")}
      badgeCount={count}
      badgeLabel={t("filterBadgeLabel", { count })}
      onPress={onPress}
    />
  );
}
