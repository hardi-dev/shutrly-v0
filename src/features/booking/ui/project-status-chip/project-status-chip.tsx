import { useTranslations } from "next-intl";

import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { PROJECT_STATUS_CHIP_COPY_NAMESPACE } from "./project-status-chip.copy";
import { projectStatusChip } from "./project-status-props";

/** Renders the status chip for a project status. */
export function ProjectStatusChip({ status }: Readonly<{ status: ProjectStatus }>) {
  const t = useTranslations(PROJECT_STATUS_CHIP_COPY_NAMESPACE);
  return <StatusChip {...projectStatusChip(t, status)} />;
}
