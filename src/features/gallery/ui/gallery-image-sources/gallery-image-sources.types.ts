import type { ImageSize } from "@/features/gallery/domain/source-image/source-image.types";

export type { ImageSize };

export interface ImageSources {
  readonly src: string;
  /** The Owner-only media route, tried once if `src` fails. */
  readonly fallbackSrc?: string;
}

export interface GalleryImageProviderProps {
  /** True when images load from Google first (false while E2E uses the fixture Drive). */
  readonly directImages: boolean;
  readonly children: React.ReactNode;
}
