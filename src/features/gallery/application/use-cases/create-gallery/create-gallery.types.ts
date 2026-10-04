import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import type { PasswordHasherPort } from "../../ports/password-hasher/password-hasher.port";

export interface CreateGalleryDeps {
  readonly galleries: GalleryRepositoryPort;
  readonly cipher: GalleryPasswordCipherPort;
  readonly hasher: PasswordHasherPort;
  readonly newId: () => string;
  readonly now: Date;
}
