import type { PickMode } from "../pick-list/pick-list.types";
import type {
  FinishedKind,
  FolderMapping,
  PhotoKind,
  PhotoPlacement,
} from "./photo-classification.types";

// A-14 and A-T1 (TD D-7, R-1): depth below the source, and the per-run photo limit.
export const SYNC_MAX_DEPTH = 5;
export const MAX_SYNC_PHOTOS = 20_000;
// ADR-018, ADR-019, TD D-7: one sync step stays within 50 subrequests. The entry cap is one full
// Drive page: a step's own cost is about 95 ms of request overhead plus about 32 ms per 1,000 photo
// rows it writes, so a bigger cap only makes each request heavier (TD R-6, A-T3).
export const SYNC_STEP_MAX_LIST_CALLS = 40;
export const SYNC_STEP_MAX_ENTRIES = 1000;
// TD D-20: bounds on the stored cursor, so a damaged value can't grow a source row.
export const CURSOR_MAX_QUEUE = 50_000;
export const CURSOR_MAX_TEXT = 2048;
export const CURSOR_MAX_ID = 200;
export const PHOTO_KINDS: readonly PhotoKind[] = ["PROOF", "EDITED", "PRINT"];

/** Tells whether a file is an image by its MIME type (A-9). @param mimeType - the file's MIME type @returns true for image/* */
export function isImageMime(mimeType: string): boolean {
  return mimeType.toLowerCase().startsWith("image/");
}

/** The kind a mapped subfolder delivers: *Foto edit*-like items (COUNT) are EDITED, print items (QUANTITY) are PRINT (F-21). @param pickMode - the item's pick mode @returns the finished kind */
export function kindForPickMode(pickMode: PickMode): FinishedKind {
  return pickMode === "COUNT" ? "EDITED" : "PRINT";
}

function covers(mapping: FolderMapping, folderPath: string): boolean {
  return folderPath === mapping.path || folderPath.startsWith(`${mapping.path}/`);
}

/** Decides a photo's kind from the Owner's subfolder mappings (F-21, replaces BR-GAL-007's folder names): the longest mapped folder that holds it makes it a finished file for that item, with the mapped folder's own level folded out of the browse path; anything else is a PROOF. @param segments - folder names from the source root down to the file's folder @param mappings - the source's subfolder mappings @returns the kind, the browse path and the item */
export function classifyPhoto(
  segments: readonly string[],
  mappings: readonly FolderMapping[] = [],
): PhotoPlacement {
  const folderPath = segments.join("/");
  let best: FolderMapping | null = null;
  for (const mapping of mappings) {
    if (covers(mapping, folderPath) && (best === null || mapping.path.length > best.path.length))
      best = mapping;
  }
  if (best === null) return { kind: "PROOF", browsePath: folderPath, projectItemId: null };
  const depth = best.path.split("/").length;
  const browse = [...segments.slice(0, depth - 1), ...segments.slice(depth)];
  return { kind: best.kind, browsePath: browse.join("/"), projectItemId: best.projectItemId };
}
