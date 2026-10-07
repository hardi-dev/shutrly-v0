import "server-only";

import type { PhotoKind } from "@/features/gallery/domain/photo-classification/photo-classification.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { GalleryPhotoRecord } from "../gallery-repository/gallery-repository.port";

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
  /** Every visible, not-missing EDITED and PRINT photo of active sources, by kind then name (D-15, BR-DEL-002). */
  readonly listFinishedPhotos: (
    context: WorkspaceContext,
    galleryId: string,
  ) => Promise<readonly GalleryPhotoRecord[]>;
  /** Id and name of every visible, not-missing proof of active sources, by name (F-19 *Unduh semua*). */
  readonly listProofFiles: (
    context: WorkspaceContext,
    galleryId: string,
  ) => Promise<readonly ProofFileRecord[]>;
}

export interface ProofFileRecord {
  readonly id: string;
  readonly fileName: string;
}
