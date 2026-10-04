import type { GalleryValidationFailure } from "../gallery-results/gallery-results.types";

export type FolderUseResult =
  { readonly ok: true; readonly projectTitles: readonly string[] } | GalleryValidationFailure;
