import type { ProjectStatus } from "@/features/booking/domain/project-status/project-status.types";
import { StatusChip } from "@/ui/primitives/status-chip/status-chip";

import { projectStatusChip } from "./project-status-props";

/** Renders the status chip for a project status. */
export function ProjectStatusChip({ status }: Readonly<{ status: ProjectStatus }>) {
  return <StatusChip {...projectStatusChip(status)} />;
}
