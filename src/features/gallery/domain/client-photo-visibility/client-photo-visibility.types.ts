import type { PhotoKind } from "../photo-classification/photo-classification.types";

export interface ClientPhotoFacts {
  readonly kind: PhotoKind;
  readonly isMissing: boolean;
  readonly isSourceRemoved: boolean;
}
