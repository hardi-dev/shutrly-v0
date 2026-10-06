import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type {
  ItemChange,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import type { SyncGroupDeps, SyncGroupResult } from "./sync-group-with-item.types";

const OK: SyncGroupResult = { ok: true };

function inUse(group: SelectionGroupRecord): SyncGroupResult {
  return { ok: false, code: "SELECTION_IN_USE", usage: group.usage, unit: group.unit };
}

/**
 * Keeps a project's selection group in step with a deal edit, inside the deal-edit
 * transaction (D-10c, BR-PRJ-009, BR-SEL-001). A refusal makes the scope roll the edit back.
 * @param deps - the selection repository bound to the transaction
 * @param context - verified workspace
 * @param change - what the booking edit did, or is about to do, to the item
 * @returns ok, or why the group can't follow
 */
export async function syncGroupWithItem(
  deps: SyncGroupDeps,
  context: WorkspaceContext,
  change: ItemChange,
): Promise<SyncGroupResult> {
  await deps.selections.lockProject(context, change.projectId);
  if (change.kind === "ADDED") {
    await deps.selections.createGroupForItem(context, change.projectId, change.definitionId);
    return OK;
  }
  const group = await deps.selections.findGroupByItemForUpdate(context, change.itemId);
  if (!group) return OK;
  if (group.status !== "OPEN") return { ok: false, code: "SELECTION_CLOSED" };
  if (change.kind === "REMOVING") {
    if (group.pickCount > 0) return inUse(group);
    await deps.selections.deleteGroup(context, group.id);
    return OK;
  }
  const base = await deps.selections.itemLimit(context, change.itemId);
  // The effective limit may not drop below what the client already picked (AC-SEL-013).
  if (base + group.extraLimit < group.usage) return inUse(group);
  await deps.selections.setBaseLimit(context, group.id, base);
  return OK;
}
