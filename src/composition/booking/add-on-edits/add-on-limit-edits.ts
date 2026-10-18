import "server-only";

import type {
  AddOnStatusResult,
  AddOnWriteResult,
} from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";
import { approveAddOn } from "@/features/booking/application/use-cases/approve-add-on/approve-add-on";
import { cancelAddOn } from "@/features/booking/application/use-cases/cancel-add-on/cancel-add-on";
import { adjustExtraLimit } from "@/features/gallery/application/use-cases/adjust-extra-limit/adjust-extra-limit";

import type { AddOnScope } from "../add-on-scope/add-on-scope.types";
import { AddOnRefusal } from "../add-on-scope/add-on-transaction";
import type { AddOnTarget } from "./add-on-edits.types";

// Scope-free: the status changes and their group-limit effect, with no request locale, so the seed
// script can run them with its own `db` (D-14). The request-bound creation stays in add-on-edits.ts.

async function applyEffect(
  scope: AddOnScope,
  target: AddOnTarget,
  result: AddOnStatusResult,
): Promise<AddOnWriteResult> {
  if (!result.ok) return result;
  if (!result.effect) return undefined;
  const adjusted = await adjustExtraLimit(scope, target.context, target.projectId, result.effect);
  if (!adjusted.ok) throw new AddOnRefusal(adjusted);
  return undefined;
}

/** Approves an add-on, then raises (and maybe reopens) its group in the same transaction (BR-ADD-004, AC-ADD-001/007). @param scope - transaction-bound repositories @param target - verified workspace, actor, project and clock @param input - untrusted `{ addOnId }` @returns undefined or a failure */
export async function approveAddOnWithLimit(
  scope: AddOnScope,
  target: AddOnTarget,
  input: unknown,
): Promise<AddOnWriteResult> {
  const deps = { addOns: scope.addOns, now: target.now };
  const result = await approveAddOn(deps, target.context, target.actorId, target.projectId, input);
  return applyEffect(scope, target, result);
}

/** Cancels an add-on, then lowers its group unless that drops below usage (BR-ADD-005, AC-ADD-005). @param scope - transaction-bound repositories @param target - verified workspace, actor, project and clock @param input - untrusted `{ addOnId }` @returns undefined or a failure */
export async function cancelAddOnWithLimit(
  scope: AddOnScope,
  target: AddOnTarget,
  input: unknown,
): Promise<AddOnWriteResult> {
  const deps = { addOns: scope.addOns, now: target.now };
  const result = await cancelAddOn(deps, target.context, target.actorId, target.projectId, input);
  return applyEffect(scope, target, result);
}
