"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";

import { TEAM_TABS_BAR_COPY_NAMESPACE } from "./team-tabs-bar.copy";
import type { TeamTab, TeamTabsBarProps } from "./team-tabs-bar.types";

const PATHS: Readonly<Record<TeamTab, string>> = {
  ACTIVE: "",
  ARCHIVED: "/archived",
  ROLES: "/roles",
};

function isTeamTab(value: string): value is TeamTab {
  return value === "ACTIVE" || value === "ARCHIVED" || value === "ROLES";
}

/**
 * Renders the phone-only Aktif / Arsip / Peran route selector; desktop uses the Page Header tabs.
 * @param props - the workspace and the current tab
 * @returns the segmented control, or nothing on desktop
 */
export function TeamTabsBar({ workspaceId, tab }: Readonly<TeamTabsBarProps>) {
  const t = useTranslations(TEAM_TABS_BAR_COPY_NAMESPACE);
  const router = useRouter();
  const isMobile = useMobileViewport();
  if (!isMobile) return null;
  const options = [
    { id: "ACTIVE", label: t("tabActive") },
    { id: "ARCHIVED", label: t("tabArchived") },
    { id: "ROLES", label: t("tabRoles") },
  ];
  function handleChange(next: string): void {
    if (isTeamTab(next)) router.push(`/w/${workspaceId}/team${PATHS[next]}`);
  }
  return (
    <SegmentedControl
      label={t("tabsLabel")}
      options={options}
      selectedId={tab}
      onChange={handleChange}
      isFullWidth
    />
  );
}
