import type { SyncFailureCode } from "@/features/gallery/domain/sync-plan/sync-plan.types";

import type { GalleryRateLimiterPort } from "../../ports/gallery-rate-limiter/gallery-rate-limiter.port";
import type { GallerySourceProviderPort } from "../../ports/gallery-source-provider/gallery-source-provider.port";
import type { GallerySourceRepositoryPort } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import type { GalleryDomainFailure } from "../gallery-results/gallery-results.types";

export interface SyncGalleryDeps {
  readonly sources: GallerySourceRepositoryPort;
  readonly provider: GallerySourceProviderPort;
  readonly rateLimiter: GalleryRateLimiterPort;
  readonly now: Date;
}

// A finished sync, successful or not; refusals (busy, rate limit, state) are failures.
export type SyncOutcome =
  | { readonly ok: true; readonly status: "SUCCEEDED" }
  | { readonly ok: true; readonly status: "FAILED"; readonly errorCode: SyncFailureCode }
  | GalleryDomainFailure;
