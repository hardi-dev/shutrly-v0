import type { ClientGalleryReaderPort } from "@/features/gallery/application/ports/client-gallery-reader/client-gallery-reader.port";
import type { ClientListCachePort } from "@/features/gallery/application/ports/client-list-cache/client-list-cache.port";
import type { GalleryBrowseReaderPort } from "@/features/gallery/application/ports/gallery-browse-reader/gallery-browse-reader.port";
import type { GalleryRateLimiterPort } from "@/features/gallery/application/ports/gallery-rate-limiter/gallery-rate-limiter.port";
import type { GallerySourceProviderPort } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import type { SelectionRepositoryPort } from "@/features/gallery/application/ports/selection-repository/selection-repository.port";
import type {
  ClientContext,
  ClientGateView,
} from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

/** Request-scoped ports a signed-in client's reads and writes use (D-4, D-15). */
export interface ClientGalleryScope {
  readonly selections: SelectionRepositoryPort;
  /** The Neon counters, for the selection-write limit (D-6). */
  readonly rateLimiter: GalleryRateLimiterPort;
  /** The client mode of the browse reader. */
  readonly browse: GalleryBrowseReaderPort;
  readonly reader: ClientGalleryReaderPort;
  readonly provider: GallerySourceProviderPort;
  readonly directImages: boolean;
  /** D-22: client photo lists by content version. */
  readonly cache: ClientListCachePort;
  readonly now: Date;
}

export type ClientScopeResult<T> =
  | { readonly kind: "NEUTRAL" }
  | { readonly kind: "PASSWORD"; readonly gate: ClientGateView }
  | {
      readonly kind: "SIGNED_IN";
      readonly gate: ClientGateView;
      readonly client: ClientContext;
      readonly value: T;
    };
