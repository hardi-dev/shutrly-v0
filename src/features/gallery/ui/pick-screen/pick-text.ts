import type { useTranslations } from "next-intl";

import type {
  OtherGroupPick,
  PickGroupView,
} from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

/** The pick screen translate function, passed into helpers that run outside a component. */
export type PickTranslate = ReturnType<typeof useTranslations>;

/** The Pilih subtitle: the limit and unit, plus the Tinjau hint for quantity groups (pilih exports). @param t - the pick translate function @param group - the group @param unit - the group's unit, already defaulted @returns the line */
export function pickSubtitle(t: PickTranslate, group: PickGroupView, unit: string): string {
  return group.mode === "QUANTITY"
    ? t("subtitleQuantity", { limit: group.limit, unit })
    : t("subtitle", { limit: group.limit, unit });
}

/** The marker of picks in other groups: the group's name, with *× n* for quantity groups (A-25). @param t - the pick translate function @param picks - the photo's picks in other groups @returns the label, or null when there are none */
export function otherGroupMarker(
  t: PickTranslate,
  picks: readonly OtherGroupPick[],
): string | null {
  if (picks.length === 0) return null;
  return picks
    .map((pick) =>
      pick.mode === "QUANTITY"
        ? t("otherGroupQuantity", { name: pick.groupName, quantity: pick.quantity })
        : pick.groupName,
    )
    .join(t("markerJoin"));
}
