import type { PhotoKind, PhotoPlacement } from "./photo-classification.types";

// A-14 and A-T1 (TD D-7, R-1): depth below the source, and the per-run photo limit.
export const SYNC_MAX_DEPTH = 5;
export const MAX_SYNC_PHOTOS = 20_000;
// ADR-018, ADR-019, TD D-7: one sync step stays within 50 subrequests and 10 ms CPU (A-T3, tuned by R-6).
export const SYNC_STEP_MAX_LIST_CALLS = 40;
export const SYNC_STEP_MAX_ENTRIES = 3000;
// TD D-20: bounds on the stored cursor, so a damaged value can't grow a source row.
export const CURSOR_MAX_QUEUE = 50_000;
export const CURSOR_MAX_TEXT = 2048;
export const CURSOR_MAX_ID = 200;
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
