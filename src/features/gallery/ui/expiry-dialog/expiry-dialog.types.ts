import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface ExpiryDialogProps {
  readonly workspaceId: string;
  readonly galleryId: string;
  readonly isDraft: boolean;
  readonly setExpiryAction: GalleryPageActions["setExpiryAction"];
  readonly onClose: () => void;
}
