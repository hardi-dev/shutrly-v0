import "server-only";

import type { AddOnTargetPort } from "@/features/booking/application/ports/add-on-target/add-on-target.port";
import type {
  AddOnStatusResult,
  AddOnWriteResult,
  CreateAddOnResult,
} from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";
import { approveAddOn } from "@/features/booking/application/use-cases/approve-add-on/approve-add-on";
import { cancelAddOn } from "@/features/booking/application/use-cases/cancel-add-on/cancel-add-on";
import { createAddOn } from "@/features/booking/application/use-cases/create-add-on/create-add-on";
import { adjustExtraLimit } from "@/features/gallery/application/use-cases/adjust-extra-limit/adjust-extra-limit";
import { checkAddOnTarget } from "@/features/gallery/application/use-cases/check-add-on-target/check-add-on-target";

import { AddOnRefusal } from "../add-on-scope/add-on-scope";
import type { AddOnScope } from "../add-on-scope/add-on-scope.types";
import type { AddOnTarget } from "./add-on-edits.types";

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

/** Creates a draft add-on; the target check reads the project's groups (D-16, BR-ADD-002). @param scope - add-on and selection repositories @param target - verified workspace, actor, project and clock @param values - untrusted form values @returns the new id or a failure */
export function createAddOnWithTarget(
  scope: AddOnScope,
  target: AddOnTarget,
  values: unknown,
): Promise<CreateAddOnResult> {
  const targets: AddOnTargetPort = {
    check: (context, projectId, groupId) => checkAddOnTarget(scope, context, projectId, groupId),
  };
  return createAddOn(
    { addOns: scope.addOns, targets },
    target.context,
    target.actorId,
    target.projectId,
    values,
  );
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
