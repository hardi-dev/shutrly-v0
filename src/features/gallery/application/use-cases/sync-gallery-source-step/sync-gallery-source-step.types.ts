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

// One step of a run: more to do (with progress), the run done, the run failed, or a refusal
// (busy, rate limit, state). Provider failures are data, not errors (TD › Error Handling).
export type SyncStepOutcome =
  | {
      readonly ok: true;
      readonly status: "CONTINUE";
      readonly foldersDone: number;
      readonly foldersTotal: number;
    }
  | {
      readonly ok: true;
      readonly status: "SUCCEEDED";
      /** Folder paths found for the first time, to map if they hold finished files (F-20). */
      readonly newFolders?: readonly string[];
    }
  | { readonly ok: true; readonly status: "FAILED"; readonly errorCode: SyncFailureCode }
  | GalleryDomainFailure;
