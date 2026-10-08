import "server-only";

import { addOnTargetCheck } from "@/features/gallery/domain/extra-limit/extra-limit";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { CheckAddOnTargetDeps, CheckAddOnTargetResult } from "./check-add-on-target.types";

/**
 * Whether a new add-on may target a group: it must be a group of the same project, `OPEN` or
 * `SUBMITTED` (BR-ADD-002, A-10, AC-ADD-002). Approval re-checks under the group lock.
 * @param deps - the selection repository
 * @param context - verified workspace
 * @param projectId - the add-on's project
 * @param groupId - the requested target
 * @returns OK, TARGET_LOCKED or TARGET_OTHER_PROJECT
 */
export async function checkAddOnTarget(
  deps: CheckAddOnTargetDeps,
  context: WorkspaceContext,
  projectId: string,
  groupId: string,
): Promise<CheckAddOnTargetResult> {
  const groups = await deps.selections.listGroups(context, projectId);
  const group = groups.find((candidate) => candidate.id === groupId);
  return group ? addOnTargetCheck(group.status) : "TARGET_OTHER_PROJECT";
}
