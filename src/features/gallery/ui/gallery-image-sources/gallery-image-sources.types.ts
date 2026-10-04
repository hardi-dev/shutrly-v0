import type { ThumbnailSize } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";

export type ImageSize = ThumbnailSize;

export interface ImageSources {
  readonly src: string;
  /** The Owner-only media route, tried once if `src` fails. */
  readonly fallbackSrc?: string;
}

export interface GalleryImageProviderProps {
  /** True when images load from Google first (false while E2E uses the fixture Drive). */
  readonly googleImages: boolean;
  readonly children: React.ReactNode;
}
