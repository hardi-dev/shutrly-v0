"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";

import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";

import { projectTabPath } from "../project-search-field/project-tab-path";
import { PROJECTS_TABS_BAR_COPY_NAMESPACE } from "./projects-tabs-bar.copy";

/** Renders the phone-only Aktif / Selesai / Dibatalkan selector; changing tab drops the search. */
export function ProjectsTabsBar({
  workspaceId,
  tab,
}: Readonly<{ workspaceId: string; tab: ProjectTab }>) {
  const t = useTranslations(PROJECTS_TABS_BAR_COPY_NAMESPACE);
  const router = useRouter();
  const isMobile = useMobileViewport();
  if (!isMobile) return null;
  const handleChange = (next: string) => {
    if (next === "ACTIVE" || next === "COMPLETED" || next === "CANCELLED") {
      router.push(projectTabPath(workspaceId, next));
    }
  };
  return (
    <SegmentedControl
      label={t("tabsLabel")}
      options={[
        { id: "ACTIVE", label: t("tabActive") },
        { id: "COMPLETED", label: t("tabCompleted") },
        { id: "CANCELLED", label: t("tabCancelled") },
      ]}
      selectedId={tab}
      onChange={handleChange}
      isFullWidth
    />
  );
}
