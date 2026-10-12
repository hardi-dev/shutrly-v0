import type { GalleryPhotoView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import { GALLERY_KIND_TAB_MESSAGE_KEY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryTranslate } from "../gallery-copy/gallery-copy.types";

/** The preview top-bar meta: folder, kind, *Hilang* when missing, and the position, e.g. *Rina-Wisuda › Akad · Proof · 12 dari 64* (AC-GAL-031). @param photo - the photo @param position - 1-based position @param total - the list size @param isMobile - the phone variant @returns the meta line */
export function previewMeta(
  t: GalleryTranslate,
  photo: GalleryPhotoView,
  position: number,
  total: number,
  isMobile = false,
): string {
  const source = photo.sourceName ?? t("sourceFallbackName");
  const path = photo.browsePath === "" ? [] : photo.browsePath.split("/");
  // Phones show only the innermost folder: *Akad · Proof · 12 dari 64*, or the source at its root.
  const folders = isMobile ? [path.at(-1) ?? source] : [source, ...path];
  const parts = [folders.join(" › "), t(GALLERY_KIND_TAB_MESSAGE_KEY[photo.kind])];
  if (photo.missing) parts.push(t("previewMissingBadge"));
  parts.push(t("previewPosition", { position: position, total: total }));
  return parts.join(" · ");
}
