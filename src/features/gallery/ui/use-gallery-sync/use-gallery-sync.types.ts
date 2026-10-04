import type { GallerySourceView } from "@/features/gallery/application/use-cases/gallery-views/gallery-views.types";

import type { GalleryPageActions } from "../gallery-actions/gallery-actions.types";
import type { SourceSyncPhase } from "../source-text/source-text.types";

export interface UseGallerySyncInput {
  readonly workspaceId: string;
  readonly syncSourceAction: GalleryPageActions["syncSourceAction"];
}

export interface GallerySyncState {
  readonly phaseOf: (sourceId: string) => SourceSyncPhase;
  readonly isRunning: boolean;
  readonly syncOne: (source: GallerySourceView) => void;
  readonly syncAll: (sources: readonly GallerySourceView[]) => void;
}

export interface SyncReport {
  readonly synced: number;
  readonly failedNames: readonly string[];
}
