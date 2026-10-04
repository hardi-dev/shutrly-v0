import type { GalleryPasswordCipherPort } from "@/features/gallery/application/ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import type { PasswordHasherPort } from "@/features/gallery/application/ports/password-hasher/password-hasher.port";
import type { RandomIntPort } from "@/features/gallery/application/ports/random-int/random-int.port";

export interface GalleryScope {
  readonly galleries: GalleryRepositoryPort;
  readonly cipher: GalleryPasswordCipherPort;
  readonly hasher: PasswordHasherPort;
  readonly randomInt: RandomIntPort;
  readonly newId: () => string;
  readonly now: Date;
}
