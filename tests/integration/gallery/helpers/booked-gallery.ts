import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import type { GalleryPasswordCipherPort } from "@/features/gallery/application/ports/gallery-password-cipher/gallery-password-cipher.port";
import type { PasswordHasherPort } from "@/features/gallery/application/ports/password-hasher/password-hasher.port";
import {
  createGalleryForBooking,
  prepareGalleryPassword,
} from "@/features/gallery/application/use-cases/create-gallery-for-booking/create-gallery-for-booking";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

/** Creates a booked project's gallery the way the booking does: prepared password, then the gallery and its selection groups (AC-GFL-001). @param db - test database @param ports - cipher and hasher @param context - verified workspace @param ownerId - the owner @param projectId - the project @param password - the gallery password @returns the prepared gallery id and the create result */
export async function createBookedGallery(
  db: Db,
  ports: { readonly cipher: GalleryPasswordCipherPort; readonly hasher: PasswordHasherPort },
  context: WorkspaceContext,
  ownerId: string,
  projectId: string,
  password = "mawar-4821",
) {
  const prepared = await prepareGalleryPassword(
    { ...ports, passwords: { propose: () => password }, newId: () => crypto.randomUUID() },
    context,
  );
  const result = await createGalleryForBooking(
    { galleries: createDrizzleGalleryRepository(db) },
    context,
    ownerId,
    projectId,
    prepared,
  );
  return { galleryId: prepared.galleryId, result };
}
