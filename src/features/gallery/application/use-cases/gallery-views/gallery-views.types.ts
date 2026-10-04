import type {
  GalleryProjectStatus,
  GalleryStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status.types";
import type { PhotoKind } from "@/features/gallery/domain/photo-classification/photo-classification.types";

import type {
  GalleryPhotoCounts,
  GallerySyncErrorCode,
  GallerySyncStatus,
} from "../../ports/gallery-repository/gallery-repository.port";

export interface GalleryProjectView {
  readonly id: string;
  readonly title: string;
  readonly status: GalleryProjectStatus;
}

// Dates are ISO strings so the view crosses the server/client boundary unchanged.
export interface GallerySummaryView {
  readonly id: string;
  readonly status: GalleryStatus;
  readonly password: string;
  readonly expiresAt: string | null;
  readonly expiryDays: number | null;
  readonly activeSourceCount: number;
  readonly failedSourceCount: number;
  readonly failedSourceNames: readonly string[];
  readonly counts: GalleryPhotoCounts;
}

export interface GalleryCardView {
  readonly project: GalleryProjectView;
  readonly canCreate: boolean;
  readonly gallery: GallerySummaryView | null;
}

export interface GallerySourceView {
  readonly id: string;
  readonly name: string | null;
  readonly workspaceSourceName: string;
  readonly removed: boolean;
  readonly removedAt: string | null;
  readonly syncStatus: GallerySyncStatus;
  readonly syncErrorCode: GallerySyncErrorCode | null;
  readonly lastSyncedAt: string | null;
  readonly proofCount: number;
  readonly editedCount: number;
  readonly printCount: number;
  readonly ignoredCount: number;
  readonly missingCount: number;
  readonly tooDeepCount: number;
}

// An active workspace source offered in *Tambah folder* (BR-SRC-006, AC-GAL-011).
export interface LinkableSourceView {
  readonly id: string;
  readonly name: string;
}

export interface GalleryPhotoView {
  readonly id: string;
  readonly fileName: string;
  readonly kind: PhotoKind;
  readonly folderPath: string;
  readonly browsePath: string;
  readonly sourceId: string;
  readonly sourceName: string | null;
  readonly missing: boolean;
  /** Owner-only *Buka di Google Drive*; null for a missing file (D-11). */
  readonly driveUrl: string | null;
}

export interface GalleryPageView {
  readonly project: GalleryProjectView;
  readonly gallery: GallerySummaryView;
  readonly sources: readonly GallerySourceView[];
  readonly linkableSources: readonly LinkableSourceView[];
  readonly previewPhotos: readonly GalleryPhotoView[];
}
