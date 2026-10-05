export type PhotoKind = "PROOF" | "EDITED" | "PRINT";

export interface PhotoPlacement {
  readonly kind: PhotoKind;
  /** The folder path with the deciding `edited` / `print` segment folded away (Main flow 5). */
  readonly browsePath: string;
}
