import type { GallerySourceRepositoryPort } from "../../ports/gallery-source-repository/gallery-source-repository.port";

export interface GalleryLifecycleDeps {
  readonly sources: GallerySourceRepositoryPort;
  readonly now: Date;
}
