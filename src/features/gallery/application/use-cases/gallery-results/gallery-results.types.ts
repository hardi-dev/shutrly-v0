import type { z } from "zod";

import type { galleryFieldErrorKeySchema } from "./gallery-results.schema";

export type GalleryFieldErrorKey = z.output<typeof galleryFieldErrorKeySchema>;
export type GalleryDomainCode =
  | "NOT_ALLOWED_FOR_PROJECT"
  | "ALREADY_EXISTS"
  | "INVALID_STATE"
  | "LAST_ACTIVE_SOURCE"
  | "SYNC_IN_PROGRESS"
  | "RATE_LIMITED";
export interface GalleryValidationFailure {
  readonly ok: false;
  readonly code: "VALIDATION_FAILED";
  readonly fieldErrors: Readonly<Record<string, GalleryFieldErrorKey>>;
}
export interface GalleryDomainFailure {
  readonly ok: false;
  readonly code: GalleryDomainCode;
}
export type GalleryFailure = GalleryValidationFailure | GalleryDomainFailure;
export type CreateGalleryResult =
  { readonly ok: true; readonly galleryId: string } | GalleryFailure;
export type GalleryWriteResult = { readonly ok: true } | GalleryFailure;
