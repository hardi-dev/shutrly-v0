import "server-only";

import { isInAllPhotos } from "@/features/gallery/domain/client-photo-visibility/client-photo-visibility";
import {
  checkPickChange,
  effectiveLimit,
} from "@/features/gallery/domain/selection-usage/selection-usage";

import type {
  PickWriter,
  SelectionGroupRecord,
  StoredPick,
} from "../../ports/selection-repository/selection-repository.port";
import { setPickSchema } from "../../schemas/set-pick/set-pick.schema";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { countSelectionWrite } from "../selection-write-limit/selection-write-limit";
import type { PickChangeRequest, SelectionWriteDeps, SetPickResult } from "./set-pick.types";

async function photoAllows(
  writer: PickWriter,
  change: PickChangeRequest,
  current: StoredPick | null,
): Promise<boolean> {
  // A-8: an existing pick may always be lowered or removed, even when the photo went missing.
  if (current && change.quantity <= current.quantity) return true;
  const photo = await writer.findPhoto(change.photoId);
  return (
    photo !== null &&
    isInAllPhotos({
      kind: photo.kind,
      isMissing: photo.missing,
      isSourceRemoved: photo.sourceRemoved,
    })
  );
}

async function applyChange(
  group: SelectionGroupRecord,
  writer: PickWriter,
  change: PickChangeRequest,
): Promise<SetPickResult> {
  if (group.status !== "OPEN") return { ok: false, code: "GROUP_NOT_OPEN" };
  const current = await writer.findPick(change.photoId);
  if (!(await photoAllows(writer, change, current)))
    return { ok: false, code: "PHOTO_NOT_SELECTABLE" };
  const currentQuantity = current?.quantity ?? 0;
  const check = checkPickChange({
    mode: group.mode,
    limit: effectiveLimit(group.baseLimit, group.extraLimit),
    usage: group.usage,
    currentQuantity,
    nextQuantity: change.quantity,
  });
  if (check === "INVALID_QUANTITY") return { ok: false, code: "INVALID" };
  if (check === "LIMIT_REACHED") return { ok: false, code: "LIMIT_REACHED" };
  if (change.quantity === 0) await writer.deletePick(change.photoId);
  else if (current) await writer.updateQuantity(change.photoId, change.quantity);
  else await writer.insertPick(change.photoId, change.quantity);
  const delta =
    group.mode === "COUNT"
      ? Math.sign(change.quantity) - Math.sign(currentQuantity)
      : change.quantity - currentQuantity;
  return { ok: true, usage: group.usage + delta, quantity: change.quantity };
}

/**
 * Picks, re-quantifies or un-picks one photo in one group under the group lock: rate limit →
 * lock → `OPEN` → selectable proof → usage check → write (D-12, BR-SEL-003…006, AC-SEL-002…007).
 * @param deps - selection repository and counters
 * @param client - the signed-in client context
 * @param input - untrusted `{ groupId, photoId, quantity }`; 0 un-picks
 * @returns the new usage, or why the change was refused
 */
export async function setPick(
  deps: SelectionWriteDeps,
  client: ClientContext,
  input: unknown,
): Promise<SetPickResult> {
  const parsed = setPickSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID" };
  if (!(await countSelectionWrite(deps.rateLimiter, client.sessionId))) {
    return { ok: false, code: "RATE_LIMITED" };
  }
  const { groupId, ...change } = parsed.data;
  const context = { workspaceId: client.workspaceId };
  const result = await deps.selections.withLockedGroup(
    context,
    client.projectId,
    groupId,
    (group, writer) => applyChange(group, writer, change),
  );
  return result === "NOT_FOUND" ? { ok: false, code: "NOT_FOUND" } : result;
}
