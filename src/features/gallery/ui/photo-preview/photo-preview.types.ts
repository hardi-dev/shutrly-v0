import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

export interface PhotoPreviewProps {
  readonly workspaceId: string;
  readonly photos: readonly GalleryPhotoView[];
  /** The open photo; null closes the preview. */
  readonly index: number | null;
  /** The size of the whole list, e.g. the folder's 64, when not every page is loaded yet. */
  readonly total: number;
  readonly onIndexChange: (index: number) => void;
  readonly onClose: () => void;
}
