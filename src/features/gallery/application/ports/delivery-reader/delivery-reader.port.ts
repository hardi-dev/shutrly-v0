import "server-only";

import type {
  GalleryProjectStatus,
  GalleryStoredStatus,
} from "@/features/gallery/domain/gallery-status/gallery-status.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** The project's gallery as the *Hasil akhir* card needs it (D-17, D-20). */
export interface DeliveryGalleryFacts {
  readonly status: GalleryStoredStatus;
  readonly expiresAt: Date | null;
  readonly finalDeliveryPublishedAt: Date | null;
  /** Visible, not-missing photos of active sources. */
  readonly editedCount: number;
  readonly printCount: number;
  /** Finished files per package item, in package order; files without an item count under their kind (F-21). */
  readonly items: readonly FinishedItemCount[];
}

export interface FinishedItemCount {
  /** The package item id, or the kind (`EDITED` / `PRINT`) for files synced before F-21. */
  readonly id: string;
  readonly name: string;
  readonly count: number;
}

export interface DeliveryFacts {
  readonly projectTitle: string;
  readonly projectStatus: GalleryProjectStatus;
  readonly completedAt: Date | null;
  readonly gallery: DeliveryGalleryFacts | null;
}

export interface DeliveryReaderPort {
  /** The facts of a project of this workspace, or null for another workspace's project (C-101). */
  readonly findFacts: (
    context: WorkspaceContext,
    projectId: string,
  ) => Promise<DeliveryFacts | null>;
}
