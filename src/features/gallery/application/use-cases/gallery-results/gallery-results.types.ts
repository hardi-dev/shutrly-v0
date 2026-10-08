import type { z } from "zod";

import type { ProviderFailureCode } from "@/features/gallery/domain/sync-plan/sync-plan.types";

import type { galleryFieldErrorKeySchema } from "./gallery-results.schema";

export type GalleryFieldErrorKey = z.output<typeof galleryFieldErrorKeySchema>;
export type GalleryDomainCode =
  | "NOT_ALLOWED_FOR_PROJECT"
  | "ALREADY_EXISTS"
  | "INVALID_STATE"
  | "LAST_ACTIVE_SOURCE"
  | "HAS_PICKS"
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
  | { readonly ok: true; readonly galleryId: string; readonly sourceId: string | null }
  | GalleryFailure;
export type GalleryWriteResult = { readonly ok: true } | GalleryFailure;

export interface PublishSourceFailure {
  readonly name: string | null;
  readonly code: ProviderFailureCode;
}
export interface PublishRefused {
  readonly ok: false;
  readonly code: "PUBLISH_REFUSED";
  /** Each folder that failed the publish-time check; empty when there is no folder (AC-GAL-017). */
  readonly failures: readonly PublishSourceFailure[];
}
export type PublishResult = { readonly ok: true } | GalleryFailure | PublishRefused;
export type ExpiryResult = { readonly ok: true; readonly reopened: boolean } | GalleryFailure;
