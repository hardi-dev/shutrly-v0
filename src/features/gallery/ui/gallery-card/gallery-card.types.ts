import type {
  GalleryCardView,
  GallerySummaryView,
} from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type {
  CreateGalleryAction,
  ProposePasswordAction,
} from "../use-create-gallery-form/use-create-gallery-form.types";

export interface GalleryCardProps {
  readonly workspaceId: string;
  readonly card: GalleryCardView;
  readonly createAction: CreateGalleryAction;
  readonly proposeAction: ProposePasswordAction;
}

export interface GallerySummaryFactsProps {
  readonly gallery: GallerySummaryView;
  readonly isMobile: boolean;
}

export interface NoGalleryProps extends GalleryCardProps {
  readonly galleryHref: string;
}

export interface EmptyText {
  readonly title: string;
  readonly body: string;
}
