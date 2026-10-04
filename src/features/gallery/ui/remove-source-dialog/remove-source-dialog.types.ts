import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface RemoveSourceDialogProps {
  readonly workspaceId: string;
  readonly source: GallerySourceView;
  readonly removeSourceAction: GalleryPageActions["removeSourceAction"];
  readonly onClose: () => void;
}
