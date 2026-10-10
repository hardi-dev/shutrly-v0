import type { SourceProvider } from "@/features/gallery/domain/source-provider/source-provider.types";

export interface ClientImage {
  readonly src: string;
  readonly fallbackSrc?: string;
}

/** A photo as a client sees it: no Drive link, folder ID or resource key (D-15, AC-ACC-012). */
export interface ClientPhotoView {
  readonly id: string;
  readonly fileName: string;
  readonly folderPath: string;
  readonly thumb: ClientImage;
  readonly preview: ClientImage;
  readonly missing: boolean;
}

export interface ClientPhotoSource {
  readonly id: string;
  readonly fileName: string;
  readonly folderPath: string;
  readonly externalFileId: string;
  readonly provider: SourceProvider;
  readonly missing: boolean;
}
