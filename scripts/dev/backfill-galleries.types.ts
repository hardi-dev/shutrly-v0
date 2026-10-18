import type { GalleryPasswordCipherPort } from "@/features/gallery/application/ports/gallery-password-cipher/gallery-password-cipher.port";
import type { PasswordHasherPort } from "@/features/gallery/application/ports/password-hasher/password-hasher.port";
import type { RandomIntPort } from "@/features/gallery/application/ports/random-int/random-int.port";

/** The password ports the backfill needs; the production set is built from GALLERY_PASSWORD_KEY. */
export interface BackfillDeps {
  readonly cipher: GalleryPasswordCipherPort;
  readonly hasher: PasswordHasherPort;
  readonly randomInt: RandomIntPort;
  readonly newId: () => string;
}

/** What one backfill run did: galleries created, and booked projects that already had one (skipped). */
export interface BackfillCounts {
  readonly created: number;
  readonly skipped: number;
}
