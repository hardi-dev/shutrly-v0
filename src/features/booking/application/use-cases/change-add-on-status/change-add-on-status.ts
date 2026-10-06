import "server-only";

import { addOnTransition, limitDelta } from "@/features/booking/domain/add-on/add-on";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import { addOnIdInputSchema } from "../../schemas/add-on-ids/add-on-ids.schema";
import type { AddOnStatusResult } from "../add-on-results/add-on-results.types";
import type { AddOnStatusDeps, AddOnStatusRequest } from "./change-add-on-status.types";

/**
 * Approves or cancels an add-on under its row lock with who and when, and reports the group-limit
 * change the scope must apply next (BR-ADD-003, BR-ADD-004, BR-ADD-005, BR-AUD-001). A repeat is a
 * no-op (TD › Concurrency › Idempotency).
 * @param deps - add-on repository bound to the scope's transaction, and the clock
 * @param context - verified workspace
 * @param request - actor, project, action and the untrusted `{ addOnId }`
 * @returns the limit effect, or ADD_ON_STATUS
 * @throws ProjectError NOT_FOUND for an add-on outside the project
 */
export async function changeAddOnStatus(
  deps: AddOnStatusDeps,
  context: WorkspaceContext,
  request: AddOnStatusRequest,
): Promise<AddOnStatusResult> {
  const parsed = addOnIdInputSchema.safeParse(request.input);
  if (!parsed.success) throw new ProjectError("NOT_FOUND");
  const addOn = await deps.addOns.findForUpdate(context, request.projectId, parsed.data.addOnId);
  if (!addOn) throw new ProjectError("NOT_FOUND");
  const move = addOnTransition(addOn.status, request.action);
  if (move.kind === "REFUSED") return { ok: false, code: "ADD_ON_STATUS" };
  if (move.kind !== "MOVE" || move.to === "DRAFT") return { ok: true, effect: null };
  await deps.addOns.setStatus(context, addOn.id, {
    status: move.to,
    actorId: request.actorId,
    at: deps.now,
  });
  const delta = limitDelta(addOn.status, move.to, addOn.quantity);
  const effect =
    addOn.selectionGroupId && delta !== 0 ? { groupId: addOn.selectionGroupId, delta } : null;
  return { ok: true, effect };
}
