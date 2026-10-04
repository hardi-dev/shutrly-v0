import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { useGalleryBrowse } from "../use-gallery-browse/use-gallery-browse";

export interface OpenPreview {
  /** CARD previews the given list; BROWSE follows *Semua foto*'s loaded pages. */
  readonly from: "CARD" | "BROWSE";
  readonly list: readonly GalleryPhotoView[];
  readonly index: number;
}

export type GalleryBrowse = ReturnType<typeof useGalleryBrowse>;
