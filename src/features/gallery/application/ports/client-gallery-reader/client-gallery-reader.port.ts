import "server-only";

import type { PhotoKind } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** What the client media and download routes need about one photo; never leaves the server (D-15, D-18). */
export interface ClientMediaPhotoRecord {
  readonly externalFileId: string;
  readonly resourceKey: string | null;
  readonly fileName: string;
  readonly kind: PhotoKind;
  readonly missing: boolean;
  readonly sourceRemoved: boolean;
}

export interface ClientGalleryReaderPort {
  /** One photo of this gallery, scoped by workspace and gallery (AC-ACC-006, AC-ACC-013). */
  readonly findClientMediaPhoto: (
    context: WorkspaceContext,
    galleryId: string,
    photoId: string,
  ) => Promise<ClientMediaPhotoRecord | null>;
}
