import "server-only";

import { lockCheck } from "@/features/gallery/domain/selection-group-status/selection-group-status";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import { GalleryError } from "../../errors/gallery-errors/gallery-errors";
import { lockSelectionGroupSchema } from "../../schemas/lock-selection-group/lock-selection-group.schema";
import type {
  LockSelectionGroupDeps,
  LockSelectionGroupResult,
} from "./lock-selection-group.types";

/**
 * Locks a submitted group (*Kunci pilihan*) or closes an open one (*Tutup pilihan*) under the group
 * lock, recording who and when; a locked group never changes again, and a client's submit and this
 * lock serialise on the same row (D-13, BR-SEL-005, BR-SEL-006, BR-AUD-001, AC-SEL-011).
 * @param deps - selection repository and the clock
 * @param context - verified workspace
 * @param actorId - the signed-in Owner
 * @param projectId - the project id
 * @param input - untrusted `{ groupId, intent }`
 * @returns the locked group's name, or why it was refused
 * @throws GalleryError NOT_FOUND for another project's or workspace's group
 */
export async function lockSelectionGroup(
  deps: LockSelectionGroupDeps,
  context: WorkspaceContext,
  actorId: string,
  projectId: string,
  input: unknown,
): Promise<LockSelectionGroupResult> {
  const parsed = lockSelectionGroupSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID" };
  const { groupId, intent } = parsed.data;
  const result = await deps.selections.withLockedGroup<LockSelectionGroupResult>(
    context,
    projectId,
    groupId,
    async (group, writer) => {
      if (lockCheck(group, intent) === "INVALID_STATE") {
        return { ok: false, code: "INVALID_STATE" };
      }
      await writer.markLocked(actorId, deps.now);
      return { ok: true, groupName: group.name };
    },
  );
  if (result === "NOT_FOUND") throw new GalleryError("NOT_FOUND");
  return result;
}
