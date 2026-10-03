"use client";

import { useRouter } from "next/navigation";

import type { ProjectTab } from "@/features/booking/domain/project-status/project-status.types";
import { useMobileViewport } from "@/ui/hooks/use-mobile-viewport/use-mobile-viewport";
import { SegmentedControl } from "@/ui/patterns/segmented-control/segmented-control";

import { PROJECT_COPY } from "../project-copy/project-copy.copy";
import { projectTabPath } from "../project-search-field/project-tab-path";

/** Renders the phone-only Aktif / Selesai / Dibatalkan selector; changing tab drops the search. */
export function ProjectsTabsBar({
  workspaceId,
  tab,
}: Readonly<{ workspaceId: string; tab: ProjectTab }>) {
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
      label={PROJECT_COPY.tabsLabel}
      options={[
        { id: "ACTIVE", label: PROJECT_COPY.tabActive },
        { id: "COMPLETED", label: PROJECT_COPY.tabCompleted },
        { id: "CANCELLED", label: PROJECT_COPY.tabCancelled },
      ]}
      selectedId={tab}
      onChange={handleChange}
      isFullWidth
    />
  );
}
