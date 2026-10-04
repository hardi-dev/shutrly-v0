"use client";

import { useRouter } from "next/navigation";

import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";

import { TEAM_COPY } from "../team-copy/team-copy.copy";
import type { TeamTab, TeamTabsBarProps } from "./team-tabs-bar.types";

const OPTIONS = [
  { id: "ACTIVE", label: TEAM_COPY.tabs.active },
  { id: "ARCHIVED", label: TEAM_COPY.tabs.archived },
  { id: "ROLES", label: TEAM_COPY.tabs.roles },
];

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
  const router = useRouter();
  const isMobile = useMobileViewport();
  if (!isMobile) return null;
  function handleChange(next: string): void {
    if (isTeamTab(next)) router.push(`/w/${workspaceId}/team${PATHS[next]}`);
  }
  return (
    <SegmentedControl
      label={TEAM_COPY.tabsLabel}
      options={OPTIONS}
      selectedId={tab}
      onChange={handleChange}
      isFullWidth
    />
  );
}
