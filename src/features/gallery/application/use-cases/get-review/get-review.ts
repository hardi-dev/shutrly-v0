import "server-only";

import { remainingPlaces } from "@/features/gallery/domain/selection-usage/selection-usage";

import { selectionGroupIdSchema } from "../../schemas/gallery-ids/gallery-ids.schema";
import { toPickedView, toPickGroupView } from "../get-pick-view/pick-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { ReviewDeps, ReviewResult } from "./get-review.types";

/**
 * Loads Tinjau for an `OPEN` group, or the read-only *Lihat pilihan* for a submitted or locked one:
 * the group with its effective limit, usage and places left, and its picks with quantities and
 * notes (A-8, A-29, BR-SEL-005, AC-SEL-008, AC-SEL-018, AC-SEL-021).
 * @param deps - selection repository and whether direct images are on
 * @param client - the signed-in client context
 * @param rawGroupId - untrusted group id from the route
 * @returns the review, or NOT_FOUND for a malformed id or another project's group
 */
export async function getReview(
  deps: ReviewDeps,
  client: ClientContext,
  rawGroupId: unknown,
): Promise<ReviewResult> {
  const groupId = selectionGroupIdSchema.safeParse(rawGroupId);
  if (!groupId.success) return { kind: "NOT_FOUND" };
  const context = { workspaceId: client.workspaceId };
  const [groups, picked] = await Promise.all([
    deps.selections.listGroups(context, client.projectId),
    deps.selections.listPickedPhotos(context, client.projectId),
  ]);
  const group = groups.find((candidate) => candidate.id === groupId.data);
  if (!group) return { kind: "NOT_FOUND" };
  const view = toPickGroupView(group);
  return {
    kind: "VIEW",
    view: {
      group: view,
      picks: picked
        .filter((record) => record.groupId === group.id)
        .map((record) => toPickedView(record, client.token, deps.directImages)),
      remaining: remainingPlaces(view.limit, view.usage),
      isEditable: group.status === "OPEN",
    },
  };
}
