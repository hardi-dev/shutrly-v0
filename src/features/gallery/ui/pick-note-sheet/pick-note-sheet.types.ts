import type { SetPickNoteInput } from "@/features/gallery/application/schemas/set-pick/set-pick.types";
import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";
import type { SetPickNoteResult } from "@/features/gallery/application/use-cases/set-pick/set-pick.types";

/** The pick a note sheet writes for. */
export interface PickNoteTarget {
  readonly groupId: string;
  readonly groupName: string;
  readonly photo: ClientPhotoView;
  readonly note: string | null;
}

export interface PickNoteSheetProps {
  readonly target: PickNoteTarget;
  readonly saveNote: (
    input: SetPickNoteInput,
  ) => Promise<SetPickNoteResult | { readonly kind: "SIGNED_OUT" }>;
  readonly onClose: () => void;
  /** The server stored the note (null when cleared). */
  readonly onSaved: (photoId: string, note: string | null) => void;
  /** The group closed or the pick is gone: the caller re-reads its view. */
  readonly onStale: () => void;
}

export type SaveOutcome = SetPickNoteResult | "SIGNED_OUT" | "FAILED";

export interface NotePhotoProps {
  readonly photo: ClientPhotoView;
  readonly groupName: string;
}
