import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import { Alert } from "@/ui/patterns/alert/alert";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryStateAlertProps } from "./gallery-state-alert.types";

/** The page-top Alert of an expired or archived gallery (design.md › Gallery page, AC-GAL-020, AC-GAL-022). */
export function GalleryStateAlert({ gallery }: Readonly<GalleryStateAlertProps>) {
  if (gallery.status === "EXPIRED" && gallery.expiresAt !== null) {
    return (
      <Alert
        tone="warning"
        title={GALLERY_COPY.expiredAlertTitle(formatGalleryDate(gallery.expiresAt))}
        body={GALLERY_COPY.expiredAlertBody}
      />
    );
  }
  if (gallery.status === "ARCHIVED") {
    return (
      <Alert
        tone="info"
        title={GALLERY_COPY.archivedAlertTitle}
        body={GALLERY_COPY.archivedAlertBody}
      />
    );
  }
  return null;
}
