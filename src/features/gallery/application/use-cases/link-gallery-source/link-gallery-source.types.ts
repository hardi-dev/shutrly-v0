import type { GallerySourceRepositoryPort } from "../../ports/gallery-source-repository/gallery-source-repository.port";
import type { GalleryFailure } from "../gallery-results/gallery-results.types";

export interface LinkGallerySourceDeps {
  readonly sources: GallerySourceRepositoryPort;
  readonly now: Date;
}

export type LinkGallerySourceResult =
  { readonly ok: true; readonly sourceId: string } | GalleryFailure;
