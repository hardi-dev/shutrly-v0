import "server-only";

import { addOnTotal, canCreateAddOn } from "@/features/booking/domain/add-on/add-on";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { CreateAddOnResult } from "../add-on-results/add-on-results.types";
import { toValidationFailure, validationFailureOf } from "../project-results/project-results";
import { createAddOnSchema } from "./create-add-on.schema";
import type { CreateAddOnDeps } from "./create-add-on.types";

/**
 * Creates a `DRAFT` add-on: validates the fields, computes the total server-side and checks the
 * target is an open or submitted group of the same project (BR-ADD-001/002/006, A-10, A-11).
 * A draft changes no limit; approval does (BR-ADD-004).
 * @param deps - add-on repository and the selection target check
 * @param context - verified workspace
 * @param actorId - the signed-in Owner
 * @param projectId - the project id
 * @param input - untrusted form values
 * @returns the new add-on id, or field / domain failures
 * @throws ProjectError NOT_FOUND for a project outside the workspace
 */
export async function createAddOn(
  deps: CreateAddOnDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
): Promise<CreateAddOnResult> {
  const parsed = createAddOnSchema.safeParse(input);
  if (!parsed.success) return toValidationFailure(parsed.error.issues);
  const status = await deps.addOns.findProjectStatus(context, projectId);
  if (!status) throw new ProjectError("NOT_FOUND");
  if (!canCreateAddOn(status)) return { ok: false, code: "PROJECT_STATUS" };
  const { selectionGroupId, quantity, unitPrice, description } = parsed.data;
  if (selectionGroupId) {
    const verdict = await deps.targets.check(context, projectId, selectionGroupId);
    if (verdict === "TARGET_LOCKED") {
      return validationFailureOf({ selectionGroupId: "TARGET_LOCKED" });
    }
    if (verdict === "TARGET_OTHER_PROJECT") {
      return validationFailureOf({ selectionGroupId: "NOT_AN_OPTION" });
    }
  }
  const addOnId = await deps.addOns.insert(context, {
    projectId,
    selectionGroupId,
    description,
    quantity,
    unitPrice,
    totalAmount: addOnTotal(quantity, unitPrice),
    createdBy: actorId,
  });
  return { ok: true, addOnId };
}
