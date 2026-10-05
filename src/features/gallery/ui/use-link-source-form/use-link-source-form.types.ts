import type { LinkGallerySourceValues } from "@/features/gallery/application/schemas/link-gallery-source/link-gallery-source.types";
import type { LinkableSourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";

export interface UseLinkSourceFormInput {
  readonly workspaceId: string;
  readonly galleryId: string;
  readonly linkableSources: readonly LinkableSourceView[];
  readonly checkFolderAction: GalleryPageActions["checkFolderAction"];
  readonly linkSourceAction: GalleryPageActions["linkSourceAction"];
  readonly onLinked: (sourceId: string) => void;
}

// The values waiting for *Tetap tambahkan* and the projects already using the folder.
export interface PendingInUse {
  readonly projects: string;
  readonly values: LinkGallerySourceValues;
}
