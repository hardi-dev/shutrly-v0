import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import type { ClientContext } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";

import { clientContextOf } from "./client-context";
import {
  addProjectItems,
  type ClientAccessFixture,
  seedPhotos,
  seedProjectWithGallery,
} from "./fixture";

export interface World {
  readonly client: ClientContext;
  readonly edit: string;
  readonly print: string;
  readonly photo: Record<string, string>;
  readonly sariPhoto: string;
}

/** A fresh *Wisuda Rina* with Foto edit (COUNT 3, notes) and Foto cetak (QUANTITY 2), per test. */
export async function seedWorld(db: Db, fixture: ClientAccessFixture): Promise<World> {
  const workspaceId = fixture.context.workspaceId;
  const base = { workspaceId, serviceId: fixture.serviceId };
  const rina = await seedProjectWithGallery(db, {
    ...base,
    clientName: "Rina",
    title: "Wisuda Rina",
    status: "POST_PROCESSING",
  });
  const target = { ...rina, workspaceId };
  await addProjectItems(db, target, [
    { name: "Foto edit", value: 3, pickMode: "COUNT", allowsPickNotes: true },
    { name: "Foto cetak", value: 2, unit: "lembar", pickMode: "QUANTITY" },
  ]);
  await createDrizzleGallerySourceRepository(db).withLockedGallery(
    fixture.context,
    rina.galleryId,
    (_gallery, writer) => writer.createSelectionGroups(),
  );
  const { photoIds } = await seedPhotos(db, target, [
    ...Array.from({ length: 9 }, (_, index) => ({ fileName: `IMG_00${String(index + 1)}.jpg` })),
    { fileName: "IMG_010.jpg", missing: true },
    { fileName: "E_001.jpg", kind: "EDITED" as const },
  ]);
  const sari = await seedProjectWithGallery(db, {
    ...base,
    clientName: "Sari",
    title: "Sari",
    status: "BOOKED",
  });
  const other = await seedPhotos(db, { workspaceId, galleryId: sari.galleryId }, [
    { fileName: "S_001.jpg" },
  ]);
  const client = { ...clientContextOf(target), sessionId: crypto.randomUUID().replaceAll("-", "") };
  const [edit, print] = await createDrizzleSelectionRepository(db).listGroups(
    fixture.context,
    rina.projectId,
  );
  return {
    client,
    edit: edit.id,
    print: print.id,
    photo: photoIds,
    sariPhoto: other.photoIds["S_001.jpg"],
  };
}

export const selectionDeps = (db: Db) => ({
  selections: createDrizzleSelectionRepository(db),
  rateLimiter: createNeonRateLimiter(db),
});

export async function groupUsage(
  db: Db,
  fixture: ClientAccessFixture,
  w: World,
  groupId: string,
): Promise<number | undefined> {
  const groups = await selectionDeps(db).selections.listGroups(fixture.context, w.client.projectId);
  return groups.find((group) => group.id === groupId)?.usage;
}
