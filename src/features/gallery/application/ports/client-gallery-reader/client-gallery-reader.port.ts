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
  ) => Promise<readonly FinishedPhotoRecord[]>;
  /** The gallery project's selection items, in package order: one *Hasil akhir* tab each, empty or not (F-20). */
  readonly listDeliveryItems: (
    context: WorkspaceContext,
    galleryId: string,
  ) => Promise<readonly DeliveryItemRecord[]>;
  /** Id and name of every visible, not-missing proof of active sources, by name (F-19 *Unduh semua*). */
  readonly listProofFiles: (
    context: WorkspaceContext,
    galleryId: string,
  ) => Promise<readonly ProofFileRecord[]>;
}

/** A finished file with the package item its mapped subfolder delivers for (F-20); null for older files. */
export interface FinishedPhotoRecord extends GalleryPhotoRecord {
  readonly itemId: string | null;
  readonly itemName: string | null;
}

export interface DeliveryItemRecord {
  readonly id: string;
  readonly name: string;
}

export interface ProofFileRecord {
  readonly id: string;
  readonly fileName: string;
}
