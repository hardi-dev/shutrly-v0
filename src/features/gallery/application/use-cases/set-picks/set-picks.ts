import "server-only";

import { isInAllPhotos } from "@/features/gallery/domain/client-photo-visibility/client-photo-visibility";
import { effectiveLimit } from "@/features/gallery/domain/selection-usage/selection-usage";

import type {
  PickWriter,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import { setPicksSchema } from "../../schemas/set-pick/set-pick.schema";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import { countSelectionWrite } from "../selection-write-limit/selection-write-limit";
import type { SelectionWriteDeps } from "../set-pick/set-pick.types";
import type { SetPicksResult } from "./set-picks.types";

/** The photos not picked in this group yet, or null when one of them can't be picked. */
async function newPhotos(writer: PickWriter, photoIds: readonly string[]) {
  const fresh: string[] = [];
  for (const photoId of new Set(photoIds)) {
    if (await writer.findPick(photoId)) continue;
    const photo = await writer.findPhoto(photoId);
    const facts = photo && {
      kind: photo.kind,
      isMissing: photo.missing,
      isSourceRemoved: photo.sourceRemoved,
    };
    if (!facts || !isInAllPhotos(facts)) return null;
    fresh.push(photoId);
  }
  return fresh;
}

async function applyPicks(
  group: SelectionGroupRecord,
  writer: PickWriter,
  photoIds: readonly string[],
): Promise<SetPicksResult> {
  if (group.status !== "OPEN") return { ok: false, code: "GROUP_NOT_OPEN" };
  const fresh = await newPhotos(writer, photoIds);
  if (fresh === null) return { ok: false, code: "PHOTO_NOT_SELECTABLE" };
  const remaining = effectiveLimit(group.baseLimit, group.extraLimit) - group.usage;
  // Owner 2026-10-07: a selection larger than what is left is refused as a whole.
  if (fresh.length > remaining)
    return { ok: false, code: "LIMIT_REACHED", remaining: Math.max(remaining, 0) };
  for (const photoId of fresh) await writer.insertPick(photoId, 1);
  return { ok: true, usage: group.usage + fresh.length, added: fresh.length };
}

/**
 * Picks several proofs for one group at once under the group lock (F-19): each new pick is × 1
 * (`QUANTITY` groups too), photos already picked are skipped, and nothing is written when one photo
 * can't be picked or the new picks pass the limit (BR-SEL-003…006, C-005).
 * @param deps - selection repository and counters
 * @param client - the signed-in client context
 * @param input - untrusted `{ groupId, photoIds }`
 * @returns the new usage and the number added, or why nothing was picked
 */
export async function setPicks(
  deps: SelectionWriteDeps,
  client: ClientContext,
  input: unknown,
): Promise<SetPicksResult> {
  const parsed = setPicksSchema.safeParse(input);
  if (!parsed.success) return { ok: false, code: "INVALID" };
  if (!(await countSelectionWrite(deps.rateLimiter, client.sessionId))) {
    return { ok: false, code: "RATE_LIMITED" };
  }
  const result = await deps.selections.withLockedGroup(
    { workspaceId: client.workspaceId },
    client.projectId,
    parsed.data.groupId,
    (group, writer) => applyPicks(group, writer, parsed.data.photoIds),
  );
  return result === "NOT_FOUND" ? { ok: false, code: "NOT_FOUND" } : result;
}
