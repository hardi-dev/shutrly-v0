import "server-only";

import { effectiveLimit } from "@/features/gallery/domain/selection-usage/selection-usage";

import type {
  PickedPhotoRecord,
  SelectionGroupRecord,
} from "../../ports/selection-repository/selection-repository.port";
import { toClientPhotoView } from "../client-views/client-views";
import type { PickedPhotoView, PickGroupView } from "./get-pick-view.types";

/** The client view of a group with its effective limit (BR-SEL-002). @param group - the stored group @returns the view */
export function toPickGroupView(group: SelectionGroupRecord): PickGroupView {
  return {
    id: group.id,
    name: group.name,
    unit: group.unit,
    mode: group.mode,
    allowsPickNotes: group.allowsPickNotes,
    limit: effectiveLimit(group.baseLimit, group.extraLimit),
    usage: group.usage,
    status: group.status,
  };
}

/** The client view of a pick, missing photos included so they can be un-picked (A-8). @param record - the stored pick with its photo facts @param token - the client access token @param directImages - whether direct provider images are on @returns the view */
export function toPickedView(
  record: PickedPhotoRecord,
  token: string,
  directImages: boolean,
): PickedPhotoView {
  return {
    photo: toClientPhotoView({ ...record, id: record.photoId }, token, directImages),
    quantity: record.quantity,
    note: record.note,
  };
}
