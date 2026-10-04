import type { PhotoKind, PhotoPlacement, SyncLimits } from "./photo-classification.types";

// A-14 and A-T1 (TD D-7, R-1): depth below the source, and the per-sync budget.
export const SYNC_MAX_DEPTH = 5;
export const MAX_SYNC_LIST_CALLS = 300;
export const MAX_SYNC_PHOTOS = 10_000;
export const SYNC_LIMITS: SyncLimits = {
  maxListCalls: MAX_SYNC_LIST_CALLS,
  maxPhotos: MAX_SYNC_PHOTOS,
};
export const PHOTO_KINDS: readonly PhotoKind[] = ["PROOF", "EDITED", "PRINT"];

function kindFolder(name: string): PhotoKind | null {
  const lower = name.toLowerCase();
  if (lower === "edited") return "EDITED";
  return lower === "print" ? "PRINT" : null;
}

/** Tells whether a file is an image by its MIME type (A-9). @param mimeType - the file's MIME type @returns true for image/* */
export function isImageMime(mimeType: string): boolean {
  return mimeType.toLowerCase().startsWith("image/");
}

/** Decides a photo's kind from its folders: the nearest `edited` / `print` ancestor, at any depth, else PROOF (BR-GAL-007). @param segments - folder names from the source root down to the file's folder @returns the kind and the folded browse path */
export function classifyPhoto(segments: readonly string[]): PhotoPlacement {
  for (let index = segments.length - 1; index >= 0; index -= 1) {
    const kind = kindFolder(segments[index]);
    if (kind !== null) {
      const browse = [...segments.slice(0, index), ...segments.slice(index + 1)];
      return { kind, browsePath: browse.join("/") };
    }
  }
  return { kind: "PROOF", browsePath: segments.join("/") };
}
