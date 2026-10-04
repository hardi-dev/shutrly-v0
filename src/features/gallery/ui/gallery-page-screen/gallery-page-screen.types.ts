import type { GalleryPageView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

export interface GalleryPageScreenProps {
  readonly workspaceId: string;
  readonly page: GalleryPageView;
}
