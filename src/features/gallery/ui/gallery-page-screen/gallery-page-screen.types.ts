import type { GalleryPageView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface GalleryPageScreenProps {
  readonly workspaceId: string;
  readonly page: GalleryPageView;
  readonly actions: GalleryPageActions;
}
