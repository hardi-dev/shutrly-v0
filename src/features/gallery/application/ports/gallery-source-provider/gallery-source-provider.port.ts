import "server-only";

import type { DriveFolderRef } from "@/features/gallery/domain/drive-folder-link/drive-folder-link.types";
import type {
  ListFolder,
  ProviderFailureCode,
} from "@/features/gallery/domain/sync-plan/sync-plan.types";

export type FolderInfo =
  | { readonly ok: true; readonly name: string }
  | { readonly ok: false; readonly code: ProviderFailureCode };

export type ThumbnailSize = "thumb" | "preview";

export interface ProviderFileRef {
  readonly fileId: string;
  readonly resourceKey: string | null;
}

export type ThumbnailResult =
  | { readonly ok: true; readonly body: ReadableStream<Uint8Array>; readonly contentType: string }
  | { readonly ok: false };

/** An original file's bytes, streamed, never buffered (F-10 D-18, spike R-1). */
export type DownloadResult =
  | {
      readonly ok: true;
      readonly body: ReadableStream<Uint8Array>;
      readonly contentType: string;
      readonly contentLength: string | null;
    }
  | { readonly ok: false };

// ADR-005, D-6: the domain never sees Drive types; errors never carry the key or a URL.
export interface GallerySourceProviderPort {
  readonly getFolder: (folder: DriveFolderRef) => Promise<FolderInfo>;
  readonly listFolder: ListFolder;
  readonly thumbnail: (file: ProviderFileRef, size: ThumbnailSize) => Promise<ThumbnailResult>;
  /** The original file (F-10 D-18); the API key stays in the adapter. */
  readonly download: (file: ProviderFileRef) => Promise<DownloadResult>;
}
