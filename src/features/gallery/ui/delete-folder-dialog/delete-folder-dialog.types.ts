import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface DeleteFolderDialogProps {
  readonly workspaceId: string;
  readonly source: GallerySourceView;
  /** The gallery's last active folder: its removal says the gallery loses the send link (AC-GFL-015). */
  readonly isLast: boolean;
  readonly deleteSourceAction: GalleryPageActions["deleteSourceAction"];
  readonly onClose: () => void;
}
