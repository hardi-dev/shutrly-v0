import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface UseExpiryFormInput {
  readonly workspaceId: string;
  readonly galleryId: string;
  readonly setExpiryAction: GalleryPageActions["setExpiryAction"];
  readonly onClose: () => void;
}
