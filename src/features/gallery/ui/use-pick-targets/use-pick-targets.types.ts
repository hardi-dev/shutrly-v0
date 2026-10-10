import type {
  SetPickInput,
  SetPickNoteInput,
} from "@/features/gallery/application/schemas/set-pick/set-pick.types";
import type { PickGroupView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import type {
  PickTargets,
  TargetPick,
} from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets.types";
import type {
  SetPickNoteResult,
  SetPickResult,
} from "@/features/gallery/application/use-cases/set-pick/set-pick.types";

type SignedOut = { readonly kind: "SIGNED_OUT" };

/** The viewer's pick actions, bound to the token by the *Semua foto* page. */
export interface ViewerPickActions {
  readonly setPick: (input: SetPickInput) => Promise<SetPickResult | SignedOut>;
  readonly setNote: (input: SetPickNoteInput) => Promise<SetPickNoteResult | SignedOut>;
  readonly reload: () => Promise<PickTargets | SignedOut>;
}

/** A group a photo can be picked for, with the photo's pick in it when there is one. */
export interface PhotoTarget {
  readonly group: PickGroupView;
  readonly pick: TargetPick | undefined;
}

export interface PickTargetsHandle {
  readonly targets: PickTargets;
  /** Every group with this photo's pick in it, in Beranda order. */
  readonly targetsOf: (photoId: string) => readonly PhotoTarget[];
  /** Picks the photo (quantity 1) in the group, or un-picks it when already picked (A-30). */
  readonly toggle: (groupId: string, photoId: string) => Promise<void>;
  readonly applyNote: (groupId: string, photoId: string, note: string | null) => void;
  readonly reload: () => Promise<void>;
}
