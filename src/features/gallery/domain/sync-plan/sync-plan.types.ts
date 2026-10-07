import type { DriveFolderRef } from "../drive-folder-link/drive-folder-link.types";
import type { PhotoKind } from "../photo-classification/photo-classification.types";

export type ProviderFailureCode = "NOT_PUBLIC" | "RATE_LIMITED" | "UNAVAILABLE";
export type SyncFailureCode = ProviderFailureCode | "TOO_LARGE";

export interface FolderEntry {
  readonly id: string;
  readonly name: string;
  readonly mimeType: string;
  readonly resourceKey: string | null;
}

export type FolderListing =
  | {
      readonly ok: true;
      readonly entries: readonly FolderEntry[];
      readonly nextPageToken: string | null;
    }
  | { readonly ok: false; readonly code: ProviderFailureCode };

export type ListFolder = (
  folder: DriveFolderRef,
  pageToken: string | null,
) => Promise<FolderListing>;

export interface SyncedPhoto {
  readonly externalFileId: string;
  readonly resourceKey: string | null;
  readonly fileName: string;
  readonly mimeType: string;
  readonly nameSortKey: string;
  readonly kind: PhotoKind;
  readonly folderPath: string;
  readonly browsePath: string;
  /** The package item a mapped subfolder delivers for; null for a proof (F-20). */
  readonly projectItemId: string | null;
}
