import type {
  EncryptedPassword,
  GalleryPasswordCipherPort,
} from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import type { PasswordHasherPort } from "../../ports/password-hasher/password-hasher.port";

/** Proposes the gallery password; the composition binds the client's name so it never contains a word of it (BR-GAL-002, A-11). */
export interface GalleryPasswordProposer {
  readonly propose: () => string;
}

/** The ports a booked project's gallery needs; the password work runs outside the transaction (D-4). */
export interface PrepareGalleryPasswordDeps {
  readonly cipher: GalleryPasswordCipherPort;
  readonly hasher: PasswordHasherPort;
  readonly passwords: GalleryPasswordProposer;
  readonly newId: () => string;
}

/** The gallery's id, encrypted password and hash, computed before the project transaction opens (ADR-017). */
export interface PreparedGalleryPassword {
  readonly galleryId: string;
  readonly password: EncryptedPassword;
  readonly passwordHash: string;
}

export interface CreateGalleryForBookingDeps {
  readonly galleries: GalleryRepositoryPort;
}

export type CreateGalleryForBookingResult =
  | { readonly ok: true; readonly created: boolean }
  | { readonly ok: false; readonly code: "NOT_ALLOWED_FOR_PROJECT" };
