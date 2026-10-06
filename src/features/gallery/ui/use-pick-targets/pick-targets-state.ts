import type {
  PickTargets,
  TargetPick,
} from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets.types";

import type { PhotoTarget } from "./use-pick-targets.types";

const isPickOf = (groupId: string, photoId: string) => (pick: TargetPick) =>
  pick.groupId === groupId && pick.photoId === photoId;

/** Every group with this photo's pick in it, in Beranda order (A-30). @param targets - groups and picks @param photoId - the photo @returns the targets */
export function targetsOfPhoto(targets: PickTargets, photoId: string): readonly PhotoTarget[] {
  return targets.groups.map((group) => ({
    group,
    pick: targets.picks.find(isPickOf(group.id, photoId)),
  }));
}

/** Applies a pick the server stored, or an un-pick, with the usage the server returned (A-30). @param targets - groups and picks @param change - group, photo, stored quantity (0 for un-pick) and new usage @returns the new targets */
export function withStoredPick(
  targets: PickTargets,
  change: { groupId: string; photoId: string; quantity: number; usage: number },
): PickTargets {
  const { groupId, photoId, quantity, usage } = change;
  const others = targets.picks.filter((pick) => !isPickOf(groupId, photoId)(pick));
  return {
    groups: targets.groups.map((group) => (group.id === groupId ? { ...group, usage } : group)),
    picks: quantity === 0 ? others : [...others, { groupId, photoId, quantity, note: null }],
  };
}

/** Stores a note on a pick of the targets (A-32). @param targets - groups and picks @param groupId - the group @param photoId - the photo @param note - the stored note, null when cleared @returns the new targets */
export function withTargetNote(
  targets: PickTargets,
  groupId: string,
  photoId: string,
  note: string | null,
): PickTargets {
  const match = isPickOf(groupId, photoId);
  return {
    ...targets,
    picks: targets.picks.map((pick) => (match(pick) ? { ...pick, note } : pick)),
  };
}
