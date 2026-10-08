import type {
  SetPickInput,
  SetPickNoteInput,
} from "@/features/gallery/application/schemas/set-pick/set-pick.types";
import type {
  PickedPhotoView,
  PickGroupView,
} from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import type {
  ReviewResult,
  ReviewView,
} from "@/features/gallery/application/use-cases/get-review/get-review.types";
import type {
  SetPickNoteResult,
  SetPickResult,
} from "@/features/gallery/application/use-cases/set-pick/set-pick.types";
import type { SubmitSelectionGroupResult } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group.types";

type SignedOut = { readonly kind: "SIGNED_OUT" };

/** The Tinjau server actions, bound to the token by the page. */
export interface ReviewActions {
  readonly setPick: (input: SetPickInput) => Promise<SetPickResult | SignedOut>;
  readonly setNote: (input: SetPickNoteInput) => Promise<SetPickNoteResult | SignedOut>;
  readonly submit: (input: {
    groupId: string;
    confirmBelowLimit: boolean;
  }) => Promise<SubmitSelectionGroupResult | SignedOut>;
  readonly reload: (groupId: string) => Promise<ReviewResult | SignedOut>;
}

export interface ReviewState {
  readonly group: PickGroupView;
  readonly picks: readonly PickedPhotoView[];
}

export interface UseReviewInput {
  readonly view: ReviewView;
  readonly token: string;
  readonly actions: ReviewActions;
}

export interface ReviewChangesHandle {
  readonly state: ReviewState;
  readonly usage: number;
  readonly remaining: number;
  readonly maxQuantityOf: (pick: PickedPhotoView) => number;
  readonly changeQuantity: (photoId: string, quantity: number) => void;
  readonly applyNote: (photoId: string, note: string | null) => void;
  readonly reload: () => Promise<void>;
}

export interface ReviewSubmitHandle {
  readonly isSubmitting: boolean;
  /** Places left the confirm notice names, or null while it is closed (A-5). */
  readonly confirmRemaining: number | null;
  /** Asks for the confirm when places remain, otherwise sends at once. */
  readonly send: () => void;
  readonly confirm: () => void;
  readonly closeConfirm: () => void;
}
