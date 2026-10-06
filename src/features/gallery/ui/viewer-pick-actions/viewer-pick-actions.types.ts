import type { ClientPhotoView } from "@/features/gallery/application/use-cases/client-views/client-views.types";

import type { PhotoTarget, PickTargetsHandle } from "../use-pick-targets/use-pick-targets.types";

export interface ViewerPickActionsProps {
  readonly photo: ClientPhotoView;
  readonly handle: PickTargetsHandle;
  /** Opens the note sheet for the photo's pick in that group (A-32). */
  readonly onNote: (target: PhotoTarget) => void;
}

export interface TargetItemProps {
  readonly target: PhotoTarget;
  readonly photoId: string;
  readonly handle: PickTargetsHandle;
  readonly onDone?: () => void;
}

export interface NoteButtonProps {
  readonly target: PhotoTarget;
  readonly fileName: string;
  readonly onNote: (target: PhotoTarget) => void;
}
