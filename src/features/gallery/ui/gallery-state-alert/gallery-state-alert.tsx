import { formatGalleryDate } from "@/features/gallery/domain/gallery-display/gallery-display";
import { useFormattingLocale } from "@/ui/hooks/use-formatting-locale/use-formatting-locale";
import { Alert } from "@/ui/patterns/alert/alert";

import { GALLERY_COPY } from "../gallery-copy/gallery-copy.copy";
import type { GalleryStateAlertProps } from "./gallery-state-alert.types";

/** The page-top Alert of an expired or archived gallery (design.md › Gallery page, AC-GAL-020, AC-GAL-022). */
export function GalleryStateAlert({ gallery, projectStatus }: Readonly<GalleryStateAlertProps>) {
  const locale = useFormattingLocale();
  if (projectStatus === "CANCELLED" && gallery.status === "DRAFT") {
    return (
      <Alert
        tone="warning"
        title={GALLERY_COPY.cancelledAlertTitle}
        body={GALLERY_COPY.cancelledAlertBody}
      />
    );
  }
  if (gallery.status === "EXPIRED" && gallery.expiresAt !== null) {
    return (
      <Alert
        tone="warning"
        title={GALLERY_COPY.expiredAlertTitle(formatGalleryDate(gallery.expiresAt, locale))}
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
