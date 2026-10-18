import "server-only";

import { getRequestFormattingLocale } from "@/composition/locale/request-formatting-locale/request-formatting-locale";
import type { CreateAddOnResult } from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";
import { createAddOn } from "@/features/booking/application/use-cases/create-add-on/create-add-on";

import type { AddOnScope } from "../add-on-scope/add-on-scope.types";
import { addOnTargetsOf } from "../add-on-targets/add-on-targets";
import type { AddOnTarget } from "./add-on-edits.types";

export { approveAddOnWithLimit, cancelAddOnWithLimit } from "./add-on-limit-edits";

/** Creates a draft add-on; the target check reads the project's groups (D-16, BR-ADD-002). @param scope - add-on and selection repositories @param target - verified workspace, actor, project and clock @param values - untrusted form values @returns the new id or a failure */
export async function createAddOnWithTarget(
  scope: AddOnScope,
  target: AddOnTarget,
  values: unknown,
): Promise<CreateAddOnResult> {
  const targets = addOnTargetsOf(scope.selections);
  const locale = await getRequestFormattingLocale();
  return createAddOn(
    { addOns: scope.addOns, targets },
    target.context,
    target.actorId,
    target.projectId,
    values,
    locale,
  );
}
