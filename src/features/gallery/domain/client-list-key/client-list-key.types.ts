import type { PhotoKind } from "../photo-classification/photo-classification.types";

export interface ClientListKeyParts {
  readonly galleryId: string;
  readonly contentVersion: number;
  readonly kind: PhotoKind;
  readonly sourceId: string | null;
  readonly path: string;
  readonly search: string;
  readonly cursor: { readonly sortKey: string; readonly id: string } | null;
}
