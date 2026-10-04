import type {
  GalleryPageView,
  GalleryPhotoView,
} from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { useGalleryBrowse } from "../use-gallery-browse/use-gallery-browse";

export interface AllPhotosModalProps {
  readonly workspaceId: string;
  readonly page: GalleryPageView;
  readonly isOpen: boolean;
  readonly onOpenChange: (isOpen: boolean) => void;
  readonly browse: ReturnType<typeof useGalleryBrowse>;
  readonly onOpenPhoto: (photo: GalleryPhotoView, list: readonly GalleryPhotoView[]) => void;
}

export type AllPhotosBodyProps = Omit<AllPhotosModalProps, "isOpen" | "onOpenChange">;
export type KindSwitchProps = Pick<AllPhotosModalProps, "browse">;
