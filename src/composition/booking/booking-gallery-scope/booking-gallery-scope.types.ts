import type { AccessTokenGeneratorPort } from "@/features/booking/application/ports/access-token-generator/access-token-generator.port";
import type { ProjectRepositoryPort } from "@/features/booking/application/ports/project-repository/project-repository.port";
import type { GalleryRepositoryPort } from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";

/** Transaction-bound repositories a booking writes through: the project and its gallery (ADR-016, BR-GAL-001). */
export interface BookingGalleryScope {
  readonly projects: ProjectRepositoryPort;
  readonly accessTokens: AccessTokenGeneratorPort;
  readonly galleries: GalleryRepositoryPort;
}
