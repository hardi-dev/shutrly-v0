import "server-only";

import { notFound } from "next/navigation";

import { ProjectError } from "@/features/booking/application/errors/project-errors/project-errors";
import { projectIdSchema } from "@/features/booking/application/schemas/project-ids/project-ids.schema";
import type {
  AddOnTargetFailure,
  AddOnWriteResult,
  CreateAddOnResult,
} from "@/features/booking/application/use-cases/add-on-results/add-on-results.types";
import { deleteDraftAddOn } from "@/features/booking/application/use-cases/delete-draft-add-on/delete-draft-add-on";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import {
  approveAddOnWithLimit,
  cancelAddOnWithLimit,
  createAddOnWithTarget,
} from "../add-on-edits/add-on-edits";
import type { AddOnTarget } from "../add-on-edits/add-on-edits.types";
import { withAddOnScope } from "../add-on-scope/add-on-scope";
import type { AddOnScope } from "../add-on-scope/add-on-scope.types";

async function runAddOnChange<T>(
  rawWorkspaceId: string,
  rawProjectId: string,
  operation: string,
  work: (scope: AddOnScope, target: AddOnTarget) => Promise<T>,
): Promise<T | AddOnTargetFailure> {
  const parsed = projectIdSchema.safeParse(rawProjectId);
  if (!parsed.success) notFound();
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const target = {
    context: verified.context,
    actorId: account.id,
    projectId: parsed.data,
    now: new Date(),
  };
  try {
    return await withAddOnScope((scope) => work(scope, target));
  } catch (error) {
    if (error instanceof ProjectError && error.code === "NOT_FOUND") notFound();
    if (!(error instanceof DomainError)) {
      logger.error("add_on.save_failed", { workspaceId: target.context.workspaceId, operation });
    }
    throw new ProjectError("SAVE_FAILED");
  }
}

/** Creates a draft add-on (AC-ADD-001…003, -006). @param ws - untrusted workspace id @param id - untrusted project id @param values - untrusted form values @returns the new id or a failure */
export function createAddOnEntry(
  ws: string,
  id: string,
  values: unknown,
): Promise<CreateAddOnResult | AddOnTargetFailure> {
  return runAddOnChange(ws, id, "create", (scope, target) =>
    createAddOnWithTarget(scope, target, values),
  );
}

/** Approves an add-on and raises its group in one transaction (AC-ADD-001, -007). @param ws - untrusted workspace id @param id - untrusted project id @param input - untrusted `{ addOnId }` @returns undefined or a failure */
export function approveAddOnEntry(
  ws: string,
  id: string,
  input: unknown,
): Promise<AddOnWriteResult> {
  return runAddOnChange(ws, id, "approve", (scope, target) =>
    approveAddOnWithLimit(scope, target, input),
  );
}

/** Cancels an add-on; refused below usage (AC-ADD-005). @param ws - untrusted workspace id @param id - untrusted project id @param input - untrusted `{ addOnId }` @returns undefined or a failure */
export function cancelAddOnEntry(
  ws: string,
  id: string,
  input: unknown,
): Promise<AddOnWriteResult> {
  return runAddOnChange(ws, id, "cancel", (scope, target) =>
    cancelAddOnWithLimit(scope, target, input),
  );
}

/** Deletes a draft add-on (*Hapus draf*, A-35). @param ws - untrusted workspace id @param id - untrusted project id @param input - untrusted `{ addOnId }` @returns undefined or ADD_ON_STATUS */
export function deleteDraftAddOnEntry(
  ws: string,
  id: string,
  input: unknown,
): Promise<AddOnWriteResult> {
  return runAddOnChange(ws, id, "delete-draft", (scope, target) =>
    deleteDraftAddOn(scope.addOns, target.context, target.projectId, input),
  );
}
