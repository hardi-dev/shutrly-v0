import type {
  PickedPhotoView,
  PickGroupView,
} from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view.types";

export interface PickRowProps {
  readonly pick: PickedPhotoView;
  readonly group: PickGroupView;
  /** `OPEN` groups show the stepper, the remove button and the note actions; others are read-only. */
  readonly isEditable: boolean;
  /** The stepper's maximum: the pick's quantity plus the places left (A-9). */
  readonly maxQuantity: number;
  readonly onQuantity: (photoId: string, quantity: number) => void;
  readonly onNote: (photoId: string) => void;
}

export interface PickNoteBlockProps {
  readonly note: string | null;
  readonly isEditable: boolean;
  readonly allowsNotes: boolean;
  readonly onNote: () => void;
}
