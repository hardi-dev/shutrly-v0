import type { GalleryBrowseReaderPort } from "@/features/gallery/application/ports/gallery-browse-reader/gallery-browse-reader.port";
import type { GalleryPasswordCipherPort } from "@/features/gallery/application/ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRateLimiterPort } from "@/features/gallery/application/ports/gallery-rate-limiter/gallery-rate-limiter.port";
import type { GalleryRepositoryPort } from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import type { GallerySourceProviderPort } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import type { GallerySourceRepositoryPort } from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type { PasswordHasherPort } from "@/features/gallery/application/ports/password-hasher/password-hasher.port";
import type { RandomIntPort } from "@/features/gallery/application/ports/random-int/random-int.port";
import type { WorkspaceSourceRepositoryPort } from "@/features/gallery/application/ports/workspace-source-repository/workspace-source-repository.port";

export interface GalleryScope {
  readonly galleries: GalleryRepositoryPort;
  readonly browse: GalleryBrowseReaderPort;
  readonly sources: GallerySourceRepositoryPort;
  readonly workspaceSources: WorkspaceSourceRepositoryPort;
  readonly provider: GallerySourceProviderPort;
  readonly rateLimiter: GalleryRateLimiterPort;
  readonly cipher: GalleryPasswordCipherPort;
  readonly hasher: PasswordHasherPort;
  readonly randomInt: RandomIntPort;
  /** Images load from Google first; false while E2E uses the fixture Drive (D-22). */
  readonly googleImages: boolean;
  readonly newId: () => string;
  readonly now: Date;
}
