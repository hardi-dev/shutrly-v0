import type { GallerySourceRepositoryPort } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import type { GalleryFailure } from "../gallery-results/gallery-results.types";
import type {
  SyncGalleryDeps,
  SyncOutcome,
} from "../sync-gallery-source/sync-gallery-source.types";

export interface LinkGallerySourceDeps extends SyncGalleryDeps {
  readonly sources: GallerySourceRepositoryPort;
}

export type LinkGallerySourceResult =
  { readonly ok: true; readonly sourceId: string; readonly sync: SyncOutcome } | GalleryFailure;
