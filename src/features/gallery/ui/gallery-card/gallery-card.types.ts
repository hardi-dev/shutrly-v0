import type {
  GalleryCardView,
  GallerySummaryView,
} from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { DeliveryCardView } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card.types";
import type { SelectionCardView } from "@/features/gallery/application/use-cases/owner-selection-views/owner-selection-views.types";

import type { GallerySummaryRow } from "../gallery-summary-text/gallery-summary-text.types";
import type {
  CheckNewGalleryFolderAction,
  CreateGalleryAction,
  ProposePasswordAction,
} from "../use-create-gallery-form/use-create-gallery-form.types";

export interface GalleryCardProps {
  readonly workspaceId: string;
  readonly card: GalleryCardView;
  readonly createAction: CreateGalleryAction;
  readonly proposeAction: ProposePasswordAction;
  /** Checks the optional first folder of *Buat galeri* (Revision OT #3). */
  readonly checkFolderAction: CheckNewGalleryFolderAction;
  /** F-10 *Pilihan klien*, summarised in a row (Owner 7, A-34). */
  readonly selection?: SelectionCardView;
  /** F-10 *Hasil akhir*, summarised in a row (Owner 7, A-34). */
  readonly delivery?: DeliveryCardView;
}

export interface GallerySummaryFactsProps {
  readonly gallery: GallerySummaryView;
  readonly isMobile: boolean;
}

export interface GallerySummaryRowsProps {
  readonly rows: readonly GallerySummaryRow[];
}

export interface NoGalleryProps extends GalleryCardProps {
  readonly galleryHref: string;
}

export interface EmptyText {
  readonly title: string;
  readonly body: string;
}
