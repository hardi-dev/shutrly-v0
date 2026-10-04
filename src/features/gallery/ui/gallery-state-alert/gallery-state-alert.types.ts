import type { GallerySummaryView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { GalleryProjectStatus } from "@/features/gallery/domain/gallery-status/gallery-status.types";

export interface GalleryStateAlertProps {
  readonly gallery: GallerySummaryView;
  readonly projectStatus: GalleryProjectStatus;
}
