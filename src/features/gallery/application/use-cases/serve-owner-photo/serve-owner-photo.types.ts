import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import type { GallerySourceProviderPort } from "../../ports/gallery-source-provider/gallery-source-provider.port";

export interface ServeOwnerPhotoDeps {
  readonly galleries: GalleryRepositoryPort;
  readonly provider: GallerySourceProviderPort;
}
