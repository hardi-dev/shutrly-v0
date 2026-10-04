import type { GallerySourceProviderPort } from "../../ports/gallery-source-provider/gallery-source-provider.port";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";
import type { PublishSourceFailure } from "../gallery-results/gallery-results.types";

export interface PublishGalleryDeps extends GalleryLifecycleDeps {
  readonly provider: GallerySourceProviderPort;
}

export interface SourceCheck {
  readonly passed: number;
  readonly failures: PublishSourceFailure[];
}
