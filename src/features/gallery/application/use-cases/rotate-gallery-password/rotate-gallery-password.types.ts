import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { PasswordHasherPort } from "../../ports/password-hasher/password-hasher.port";
import type { GalleryLifecycleDeps } from "../gallery-lock/gallery-lock.types";

export interface RotateGalleryPasswordDeps extends GalleryLifecycleDeps {
  readonly cipher: GalleryPasswordCipherPort;
  readonly hasher: PasswordHasherPort;
}
