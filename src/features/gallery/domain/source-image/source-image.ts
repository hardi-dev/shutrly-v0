import { GOOGLE_IMAGE_WIDTHS, googleImageUrl } from "../google-image-url/google-image-url";
import type { SourceProvider } from "../source-provider/source-provider.types";
import type { DirectImageUrl, ImageSize } from "./source-image.types";

export const IMAGE_WIDTHS: Readonly<Record<ImageSize, number>> = {
  thumb: GOOGLE_IMAGE_WIDTHS.tile,
  preview: GOOGLE_IMAGE_WIDTHS.preview,
};

// A provider that can serve its images straight to the browser lists a builder here (ADR-019,
// TD D-22). One that isn't listed always goes through the media route, so adding Dropbox, OneDrive
// or S3 later is one entry here and a provider adapter, not a change to the UI.
const DIRECT_IMAGE_URLS: Readonly<Partial<Record<SourceProvider, DirectImageUrl>>> = {
  GOOGLE_DRIVE: googleImageUrl,
};

/** Builds the URL a browser can load a photo from without Shutrly, or null when its provider can't serve that (so the caller uses the Owner media route). @param provider - the photo's source provider @param externalFileId - the provider's file ID @param size - thumb or preview @returns the URL, or null */
export function directImageUrl(
  provider: SourceProvider,
  externalFileId: string,
  size: ImageSize,
): string | null {
  return DIRECT_IMAGE_URLS[provider]?.(externalFileId, IMAGE_WIDTHS[size]) ?? null;
}
