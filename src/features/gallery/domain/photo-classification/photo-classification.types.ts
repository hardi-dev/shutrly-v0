export type PhotoKind = "PROOF" | "EDITED" | "PRINT";
export type FinishedKind = Exclude<PhotoKind, "PROOF">;

/** One subfolder of a source mapped to a package item (F-21). */
export interface FolderMapping {
  /** The folder path from the source root, segments joined by `/`. */
  readonly path: string;
  readonly kind: FinishedKind;
  readonly projectItemId: string;
}

export interface PhotoPlacement {
  readonly kind: PhotoKind;
  /** The folder path with the mapped folder's own level folded away (Main flow 5). */
  readonly browsePath: string;
  /** The item a mapped subfolder delivers for; null for a proof. */
  readonly projectItemId: string | null;
}
