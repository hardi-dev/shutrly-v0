import type { BrowseCursor } from "@/features/gallery/application/ports/gallery-browse-reader/gallery-browse-reader.port";
import type {
  SetPickInput,
  SetPickNoteInput,
} from "@/features/gallery/application/schemas/set-pick/set-pick.types";
import type { PickPhotosPage } from "@/features/gallery/application/use-cases/browse-pick-photos/browse-pick-photos.types";
import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import type {
  OtherGroupPick,
  PickedPhotoView,
  PickGroupView,
  PickView,
  PickViewResult,
} from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";
import type {
  SetPickNoteResult,
  SetPickResult,
} from "@/features/gallery/application/use-cases/set-pick/set-pick.types";

type SignedOut = { readonly kind: "SIGNED_OUT" };

/** The Pilih server actions, bound to the token by the page. */
export interface PickScreenActions {
  readonly setPick: (input: SetPickInput) => Promise<SetPickResult | SignedOut>;
  readonly setNote: (input: SetPickNoteInput) => Promise<SetPickNoteResult | SignedOut>;
  readonly browse: (cursor: BrowseCursor | null) => Promise<PickPhotosPage | SignedOut>;
  readonly reload: (groupId: string) => Promise<PickViewResult | SignedOut>;
}

export type PickFilter = "ALL" | "PICKED";

export interface PickGridState {
  readonly photos: readonly ClientPhotoView[];
  readonly total: number;
  readonly nextCursor: BrowseCursor | null;
  readonly isLoadingMore: boolean;
  readonly hasFailed: boolean;
}

export interface PickSelectionState {
  readonly group: PickGroupView;
  /** This group's picks by photo id, missing photos included (A-8). */
  readonly picks: ReadonlyMap<string, PickedPhotoView>;
  readonly otherPicks: ReadonlyMap<string, readonly OtherGroupPick[]>;
}

export interface PickSelectionHandle {
  readonly state: PickSelectionState;
  readonly usage: number;
  readonly isFull: boolean;
  readonly toggle: (photo: ClientPhotoView, isSelected: boolean) => void;
  /** Stores a note the server accepted (A-32). */
  readonly applyNote: (photoId: string, note: string | null) => void;
  /** Re-reads the group after a refusal; a group that closed opens its read-only view. */
  readonly reload: () => Promise<void>;
}

export interface PickGridHandle {
  readonly state: PickGridState;
  readonly loadMore: () => Promise<void>;
  readonly retry: () => Promise<void>;
}

export interface UsePickSelectionInput {
  readonly view: PickView;
  readonly token: string;
  readonly actions: PickScreenActions;
}
