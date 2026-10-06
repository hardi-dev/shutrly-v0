export type PhotoKind = "PROOF" | "EDITED" | "PRINT";

export interface ClientPhotoFacts {
  readonly kind: PhotoKind;
  readonly isMissing: boolean;
  readonly isSourceRemoved: boolean;
}
