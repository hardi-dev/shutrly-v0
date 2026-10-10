import type {
  OtherGroupPick,
  PickGroupView,
} from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

import { CLIENT_COPY } from "../client-copy/client-copy.copy";
import { PICK_COPY as COPY } from "./pick-screen.copy";

/** The Pilih subtitle: the limit and unit, plus the Tinjau hint for quantity groups (pilih exports). @param group - the group @returns the line */
export function pickSubtitle(group: PickGroupView): string {
  const unit = group.unit ?? CLIENT_COPY.defaultUnit;
  return group.mode === "QUANTITY"
    ? COPY.subtitleQuantity(group.limit, unit)
    : COPY.subtitle(group.limit, unit);
}

/** The marker of picks in other groups: the group's name, with *× n* for quantity groups (A-25). @param picks - the photo's picks in other groups @returns the label, or null when there are none */
export function otherGroupMarker(picks: readonly OtherGroupPick[]): string | null {
  if (picks.length === 0) return null;
  return picks
    .map((pick) =>
      pick.mode === "QUANTITY"
        ? COPY.otherGroupQuantity(pick.groupName, pick.quantity)
        : pick.groupName,
    )
    .join(COPY.markerJoin);
}
