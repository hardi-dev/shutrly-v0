import "server-only";

import { addOnTransition } from "@/features/booking/domain/add-on/add-on";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { ProjectError } from "../../errors/project-errors/project-errors";
import type { AddOnRepositoryPort } from "../../ports/add-on-repository/add-on-repository.port";
import { addOnIdInputSchema } from "../../schemas/add-on-ids/add-on-ids.schema";
import type { AddOnWriteResult } from "../add-on-results/add-on-results.types";

/**
 * Deletes a `DRAFT` add-on (*Hapus draf*); a draft never changed a limit, so nothing else moves
 * and no audit is kept. Approved and cancelled add-ons are never deleted (BR-ADD-003, A-35).
 * @param addOns - add-on repository
 * @param context - verified workspace
 * @param projectId - the project id
 * @param input - untrusted `{ addOnId }`
 * @returns undefined, or ADD_ON_STATUS
 * @throws ProjectError NOT_FOUND for an add-on outside the project
 */
export async function deleteDraftAddOn(
  addOns: AddOnRepositoryPort,
  context: WorkspaceContext,
  projectId: string,
  input: unknown,
): Promise<AddOnWriteResult> {
  const parsed = addOnIdInputSchema.safeParse(input);
  if (!parsed.success) throw new ProjectError("NOT_FOUND");
  const addOn = await addOns.findForUpdate(context, projectId, parsed.data.addOnId);
  if (!addOn) throw new ProjectError("NOT_FOUND");
  if (addOnTransition(addOn.status, "DELETE").kind !== "DELETE") {
    return { ok: false, code: "ADD_ON_STATUS" };
  }
  await addOns.deleteDraft(context, addOn.id);
  return undefined;
}
