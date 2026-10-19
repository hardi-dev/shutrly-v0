import "server-only";

import type { CreateAddOnResult } from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";
import { createAddOn } from "@/features/booking/application/use-cases/create-add-on/create-add-on";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import type { AddOnScope } from "../add-on-scope/add-on-scope.types";
import { addOnTargetsOf } from "../add-on-targets/add-on-targets";
import type { AddOnTarget } from "./add-on-edits.types";

export { approveAddOnWithLimit, cancelAddOnWithLimit } from "./add-on-limit-edits";

/**
 * Creates a draft add-on; the target check reads the project's groups (D-16, BR-ADD-002). Scope-free: the
 * request entry reads the formatting locale, so the seed and the integration tests can call this too.
 * @param scope - add-on and selection repositories
 * @param target - verified workspace, actor, project and clock
 * @param values - untrusted form values
 * @param locale - the formatting locale the amounts are parsed in
 * @returns the new id or a failure
 */
export async function createAddOnWithTarget(
  scope: AddOnScope,
  target: AddOnTarget,
  values: unknown,
  locale: FormattingLocale,
): Promise<CreateAddOnResult> {
  const targets = addOnTargetsOf(scope.selections);
  return createAddOn(
    { addOns: scope.addOns, targets },
    target.context,
    target.actorId,
    target.projectId,
    values,
    locale,
  );
}
