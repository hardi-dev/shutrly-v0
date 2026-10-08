import type { z } from "zod";

import type { GalleryPasswordCipherPort } from "../../ports/gallery-password-cipher/gallery-password-cipher.port";
import type { GalleryRepositoryPort } from "../../ports/gallery-repository/gallery-repository.port";
import type { PasswordHasherPort } from "../../ports/password-hasher/password-hasher.port";
import type { linkGallerySourceSchema } from "../../schemas/link-gallery-source/link-gallery-source.schema";

export interface CreateGalleryDeps {
  readonly galleries: GalleryRepositoryPort;
  readonly cipher: GalleryPasswordCipherPort;
  readonly hasher: PasswordHasherPort;
  readonly newId: () => string;
  readonly now: Date;
}

/** The optional first-folder section of *Buat galeri*, after parsing (Revision OT #3). */
export type FirstFolderInput = z.output<typeof linkGallerySourceSchema>;
