import "server-only";

import { canCreateAddOn } from "@/features/booking/domain/add-on/add-on";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { AddOnCardView, ListAddOnsDeps } from "./list-add-ons.types";

/**
 * The *Add-on* card: the project's add-ons oldest first with their target group, the groups a new
 * add-on may target, and the locked ones (spec §4, A-10, A-11, AC-ADD-001).
 * @param deps - add-on repository and the selection side
 * @param context - verified workspace
 * @param projectId - the project id
 * @returns the card view
 * @throws ProjectError NOT_FOUND for a project outside the workspace
 */
export async function listAddOns(
  deps: ListAddOnsDeps,
  context: WorkspaceContext,
  projectId: string,
): Promise<AddOnCardView> {
  const status = await deps.addOns.findProjectStatus(context, projectId);
  if (!status) throw new ProjectError("NOT_FOUND");
  const [addOns, groups] = await Promise.all([
    deps.addOns.list(context, projectId),
    deps.targets.listGroups(context, projectId),
  ]);
  const groupOf = (id: string | null) => groups.find((group) => group.id === id) ?? null;
  return {
    canCreate: canCreateAddOn(status),
    addOns: addOns.map((addOn) => ({ ...addOn, group: groupOf(addOn.selectionGroupId) })),
    targets: groups.filter((group) => group.isTargetable),
    lockedGroupNames: groups
      .filter((group) => group.status === "LOCKED")
      .map((group) => group.name),
  };
}
