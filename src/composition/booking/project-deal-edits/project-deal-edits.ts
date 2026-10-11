import "server-only";

import { addItemInputSchema } from "@/features/booking/application/schemas/project-edit-input/project-edit-input.schema";
import {
  addProjectItem,
  removeProjectItem,
  updateProjectItemValue,
} from "@/features/booking/application/use-cases/edit-project/project-item-edits";
import type {
  ProjectFailure,
  ProjectWriteResult,
} from "@/features/booking/application/use-cases/project-results/project-results.types";
import type { ItemChange } from "@/features/gallery/application/ports/selection-repository/selection-repository.port";
import { syncGroupWithItem } from "@/features/gallery/application/use-cases/sync-group-with-item/sync-group-with-item";
import type { SyncGroupResult } from "@/features/gallery/application/use-cases/sync-group-with-item/sync-group-with-item.types";
import type { FormattingLocale } from "@/shared/locale/locale.types";

import { DealEditRefusal } from "../project-deal-edit-scope/project-deal-edit-scope";
import type { ProjectDealEditScope } from "../project-deal-edit-scope/project-deal-edit-scope.types";
import type { DealEditTarget } from "./project-deal-edits.types";

function toFailure(result: SyncGroupResult): ProjectFailure | undefined {
  if (result.ok) return undefined;
  if (result.code !== "SELECTION_IN_USE") return { ok: false, code: result.code };
  return { ok: false, code: "SELECTION_IN_USE", usage: result.usage, unit: result.unit };
}

async function follow(scope: ProjectDealEditScope, target: DealEditTarget, change: ItemChange) {
  const failure = toFailure(await syncGroupWithItem(scope, target.context, change));
  if (failure) throw new DealEditRefusal(failure);
}

/** Adds a package item, then its selection group when the gallery is published (D-10c). @param scope - transaction-bound repositories @param target - verified workspace, actor and project @param values - untrusted `{ definitionId, value }` @returns undefined or a failure */
export async function addItemWithGroup(
  scope: ProjectDealEditScope,
  target: DealEditTarget,
  values: unknown,
  locale: FormattingLocale,
): Promise<ProjectWriteResult> {
  const { context, actorId, projectId } = target;
  const result = await addProjectItem(scope.projects, context, actorId, projectId, values, locale);
  const parsed = addItemInputSchema.safeParse(values);
  if (result === undefined && parsed.success) {
    const definitionId = parsed.data.definitionId;
    await follow(scope, target, { kind: "ADDED", projectId, definitionId });
  }
  return result;
}

/** Changes an item's value; the group's limit follows or the edit is refused (D-10c, AC-SEL-013/014). @param scope - transaction-bound repositories @param target - verified workspace, actor and project @param itemId - the item @param values - untrusted `{ value }` @returns undefined or a failure */
export async function updateItemWithGroup(
  scope: ProjectDealEditScope,
  target: DealEditTarget,
  itemId: string,
  values: unknown,
  locale: FormattingLocale,
): Promise<ProjectWriteResult> {
  const { context, actorId, projectId } = target;
  const result = await updateProjectItemValue(
    scope.projects,
    context,
    actorId,
    projectId,
    itemId,
    values,
    locale,
  );
  if (result === undefined) await follow(scope, target, { kind: "VALUE", projectId, itemId });
  return result;
}

/** Removes an item after its group; a group with picks, an approved add-on or not open refuses it (D-10c). @param scope - transaction-bound repositories @param target - verified workspace, actor and project @param itemId - the item @returns undefined or a failure */
export async function removeItemWithGroup(
  scope: ProjectDealEditScope,
  target: DealEditTarget,
  itemId: string,
): Promise<ProjectWriteResult> {
  // The group goes first: project_item rows with a group can't be deleted (FK restrict).
  await follow(scope, target, { kind: "REMOVING", projectId: target.projectId, itemId });
  return removeProjectItem(scope.projects, target.context, target.projectId, itemId);
}
