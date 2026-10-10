import "server-only";

import { toPickGroupView } from "../get-pick-view/pick-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type { PickTargets, PickTargetsDeps } from "./list-pick-targets.types";

/**
 * Lists the groups *Pilih untuk…* offers, with effective limits, usage and status (submitted and
 * locked ones are shown disabled), and the client's picks with their notes (A-30, A-32, AC-SEL-019).
 * @param deps - the selection repository
 * @param client - the signed-in client context
 * @returns the groups and picks
 */
export async function listPickTargets(
  deps: PickTargetsDeps,
  client: ClientContext,
): Promise<PickTargets> {
  const context = { workspaceId: client.workspaceId };
  const [groups, picked] = await Promise.all([
    deps.selections.listGroups(context, client.projectId),
    deps.selections.listPickedPhotos(context, client.projectId),
  ]);
  return {
    groups: groups.map(toPickGroupView),
    picks: picked.map(({ groupId, photoId, quantity, note }) => ({
      groupId,
      photoId,
      quantity,
      note,
    })),
  };
}
