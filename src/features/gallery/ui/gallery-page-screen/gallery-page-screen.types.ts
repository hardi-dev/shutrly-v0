import type { GalleryPageScreenView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface GalleryPageScreenProps {
  readonly workspaceId: string;
  readonly page: GalleryPageScreenView;
  readonly actions: GalleryPageActions;
}
