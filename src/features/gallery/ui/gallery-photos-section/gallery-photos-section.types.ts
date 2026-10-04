import type { ReactNode } from "react";

import type {
  GalleryPageView,
  GalleryPhotoView,
} from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

export interface GalleryPhotosSectionProps {
  readonly workspaceId: string;
  readonly page: GalleryPageView;
  /** *Lihat semua foto*, wired by *Semua foto* (Slice 4). */
  readonly viewAll?: ReactNode;
  readonly onOpenPhoto?: (photo: GalleryPhotoView, list: readonly GalleryPhotoView[]) => void;
}

export interface PreviewTileProps {
  readonly workspaceId: string;
  readonly photo: GalleryPhotoView;
  readonly list: readonly GalleryPhotoView[];
  readonly onOpenPhoto: GalleryPhotosSectionProps["onOpenPhoto"];
}
