import "server-only";

import { notFound } from "next/navigation";

import { ProjectError } from "@/features/booking/application/errors/project-errors/project-errors";
import { projectIdSchema } from "@/features/booking/application/schemas/project-ids/project-ids.schema";
import type { ProjectWriteResult } from "@/features/booking/application/use-cases/project-results/project-results.types";
import { DomainError } from "@/shared/errors/domain-error";
import { logger } from "@/shared/logging/logger";

import { requireOwnerOrRedirect } from "../../auth/owner-guard/owner-guard";
import { verifyOwnerWorkspace } from "../../workspace/owner-workspace/owner-workspace";
import { withProjectDealEditScope } from "../project-deal-edit-scope/project-deal-edit-scope";
import type { ProjectDealEditScope } from "../project-deal-edit-scope/project-deal-edit-scope.types";
import {
  addItemWithGroup,
  removeItemWithGroup,
  updateItemWithGroup,
} from "../project-deal-edits/project-deal-edits";
import type { DealEditTarget } from "../project-deal-edits/project-deal-edits.types";

function idOrNotFound(rawId: string): string {
  const parsed = projectIdSchema.safeParse(rawId);
  if (!parsed.success) notFound();
  return parsed.data;
}

async function runDealEdit(
  rawWorkspaceId: string,
  rawProjectId: string,
  operation: string,
  work: (scope: ProjectDealEditScope, target: DealEditTarget) => Promise<ProjectWriteResult>,
): Promise<ProjectWriteResult> {
  const projectId = idOrNotFound(rawProjectId);
  const account = await requireOwnerOrRedirect();
  const verified = await verifyOwnerWorkspace(rawWorkspaceId);
  const target = { context: verified.context, actorId: account.id, projectId };
  try {
    return await withProjectDealEditScope((scope) => work(scope, target));
  } catch (error) {
    if (error instanceof ProjectError && error.code === "NOT_FOUND") notFound();
    if (!(error instanceof DomainError)) {
      logger.error("project.save_failed", { workspaceId: target.context.workspaceId, operation });
    }
    throw new ProjectError("SAVE_FAILED");
  }
}

/** Adds a package item and, with a published gallery, its group (AC-PRJ-017, AC-SEL-013). @param ws - untrusted workspace id @param id - untrusted project id @param values - untrusted `{ definitionId, value }` @returns undefined or a failure */
export function addProjectItemEntry(ws: string, id: string, values: unknown) {
  return runDealEdit(ws, id, "add-item", (scope, target) =>
    addItemWithGroup(scope, target, values),
  );
}

/** Changes an item's value; its group follows or refuses (AC-PRJ-017, AC-SEL-013/014). @param ws - untrusted workspace id @param id - untrusted project id @param rawItemId - untrusted item id @param values - untrusted `{ value }` @returns undefined or a failure */
export function updateProjectItemValueEntry(
  ws: string,
  id: string,
  rawItemId: string,
  values: unknown,
) {
  const itemId = idOrNotFound(rawItemId);
  return runDealEdit(ws, id, "update-item", (scope, target) =>
    updateItemWithGroup(scope, target, itemId, values),
  );
}

/** Removes an item unless its group refuses (AC-PRJ-017, AC-SEL-013/014). @param ws - untrusted workspace id @param id - untrusted project id @param rawItemId - untrusted item id @returns undefined or a failure */
export function removeProjectItemEntry(ws: string, id: string, rawItemId: string) {
  const itemId = idOrNotFound(rawItemId);
  return runDealEdit(ws, id, "remove-item", (scope, target) =>
    removeItemWithGroup(scope, target, itemId),
  );
}
