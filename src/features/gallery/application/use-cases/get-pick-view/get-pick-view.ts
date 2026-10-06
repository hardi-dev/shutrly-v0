import "server-only";

import { effectiveLimit } from "@/features/gallery/domain/selection-usage/selection-usage";

import type {
  PickedPhotoRecord,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import { selectionGroupIdSchema } from "../../schemas/gallery-ids/gallery-ids.schema";
import { toClientPhotoView } from "../client-views/client-views";
import type { ClientContext } from "../resolve-client-access/resolve-client-access.types";
import type {
  OtherGroupPick,
  PickedPhotoView,
  PickViewDeps,
  PickViewResult,
} from "./get-pick-view.types";

function toPicked(
  record: PickedPhotoRecord,
  token: string,
  directImages: boolean,
): PickedPhotoView {
  const source = { ...record, id: record.photoId };
  return {
    photo: toClientPhotoView(source, token, directImages),
    quantity: record.quantity,
    note: record.note,
  };
}

function toOther(record: PickedPhotoRecord, groups: readonly SelectionGroupRecord[]) {
  const group = groups.find((candidate) => candidate.id === record.groupId);
  if (!group) return [];
  const other: OtherGroupPick = {
    photoId: record.photoId,
    groupName: group.name,
    mode: group.mode,
    quantity: record.quantity,
  };
  return [other];
}

/**
 * Loads a Pilih screen: the group with its effective limit and usage, this group's picks
 * (missing photos included) and the markers of picks in other groups (A-8, A-25, A-27, D-12).
 * @param deps - selection repository and whether direct images are on
 * @param client - the signed-in client context
 * @param rawGroupId - untrusted group id from the route
 * @returns the view, NOT_OPEN for a submitted or locked group, or NOT_FOUND
 */
export async function getPickView(
  deps: PickViewDeps,
  client: ClientContext,
  rawGroupId: unknown,
): Promise<PickViewResult> {
  const groupId = selectionGroupIdSchema.safeParse(rawGroupId);
  if (!groupId.success) return { kind: "NOT_FOUND" };
  const context = { workspaceId: client.workspaceId };
  const [groups, picked] = await Promise.all([
    deps.selections.listGroups(context, client.projectId),
    deps.selections.listPickedPhotos(context, client.projectId),
  ]);
  const group = groups.find((candidate) => candidate.id === groupId.data);
  if (!group) return { kind: "NOT_FOUND" };
  if (group.status !== "OPEN") return { kind: "NOT_OPEN" };
  const own = picked.filter((record) => record.groupId === group.id);
  const others = picked.filter((record) => record.groupId !== group.id);
  return {
    kind: "VIEW",
    view: {
      group: {
        id: group.id,
        name: group.name,
        unit: group.unit,
        mode: group.mode,
        allowsPickNotes: group.allowsPickNotes,
        limit: effectiveLimit(group.baseLimit, group.extraLimit),
        usage: group.usage,
        status: group.status,
      },
      picks: own.map((record) => toPicked(record, client.token, deps.directImages)),
      otherPicks: others.flatMap((record) => toOther(record, groups)),
    },
  };
}
