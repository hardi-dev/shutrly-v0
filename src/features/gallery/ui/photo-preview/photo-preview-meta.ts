import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";

/** The preview top-bar meta: folder, kind, *Hilang* when missing, and the position, e.g. *Rina-Wisuda › Akad · Proof · 12 dari 64* (AC-GAL-031). @param photo - the photo @param position - 1-based position @param total - the list size @returns the meta line */
export function previewMeta(photo: GalleryPhotoView, position: number, total: number): string {
  const folders = [
    photo.sourceName ?? GALLERY_COPY.sourceFallbackName,
    ...(photo.browsePath === "" ? [] : photo.browsePath.split("/")),
  ];
  const parts = [folders.join(" › "), GALLERY_COPY.kindTab[photo.kind]];
  if (photo.missing) parts.push(GALLERY_COPY.previewMissingBadge);
  parts.push(GALLERY_COPY.previewPosition(position, total));
  return parts.join(" · ");
}
