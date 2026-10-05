import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";
import type { SyncStepOutcome } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";
import type { SourceSyncPhase, SourceSyncProgress } from "../source-text/source-text.types";

export interface UseGallerySyncInput {
  readonly workspaceId: string;
  readonly syncSourceAction: GalleryPageActions["syncSourceAction"];
}

// A folder the loop syncs; a source that was just linked has no row yet, so the name is a fallback.
export interface SyncTarget {
  readonly id: string;
  readonly name: string;
}

// How one source's run ended: every step before the last answered CONTINUE.
export type SyncRunOutcome = Exclude<SyncStepOutcome, { readonly status: "CONTINUE" }>;

export interface GallerySyncState {
  readonly phaseOf: (sourceId: string) => SourceSyncPhase;
  readonly progressOf: (sourceId: string) => SourceSyncProgress;
  readonly isRunning: boolean;
  readonly syncOne: (source: GallerySourceView) => void;
  readonly syncAll: (sources: readonly GallerySourceView[]) => void;
  /** Starts the first sync of a source that was just linked (TD D-27). */
  readonly syncNew: (sourceId: string) => void;
}

export interface SyncReport {
  readonly synced: number;
  readonly failedNames: readonly string[];
}
