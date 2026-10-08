import "server-only";

import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { AddOnStatusResult } from "../add-on-results/add-on-results.types";
import { changeAddOnStatus } from "../change-add-on-status/change-add-on-status";
import type { AddOnStatusDeps } from "../change-add-on-status/change-add-on-status.types";

/**
 * Approves a draft add-on (*Setujui*): the target group's limit rises next, in the same scope (BR-ADD-004, AC-ADD-001, AC-ADD-007).
 * @param deps - add-on repository bound to the scope's transaction, and the clock
 * @param context - verified workspace
 * @param actorId - the signed-in Owner
 * @param projectId - the project id
 * @param input - untrusted `{ addOnId }`
 * @returns the limit effect, or ADD_ON_STATUS
 */
export function approveAddOn(
  deps: AddOnStatusDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
): Promise<AddOnStatusResult> {
  return changeAddOnStatus(deps, context, { actorId, projectId, action: "APPROVE", input });
}
