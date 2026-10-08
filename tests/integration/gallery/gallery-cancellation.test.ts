import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { FakeDriveProvider, RINA_FOLDER_ID } from "@tests/support/gallery/fake-drive-provider";
import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { project } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { cancelProject } from "@/features/booking/application/use-cases/cancel-project/cancel-project";
import { archiveGalleryOfCancelledProject } from "@/features/gallery/application/use-cases/archive-gallery-of-cancelled-project/archive-gallery-of-cancelled-project";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { publishGallery } from "@/features/gallery/application/use-cases/publish-gallery/publish-gallery";

import { openTestDb } from "../helpers/test-db";
import { type GallerySeed, seedGalleryWorkspace } from "./helpers/gallery-seed";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const cipher = createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY);

function lifecycleDeps() {
  return {
    sources: createDrizzleGallerySourceRepository(db),
    provider: FakeDriveProvider.withFixture(),
    rateLimiter: { hit: () => Promise.resolve(true), peek: () => Promise.resolve(true) },
    now: new Date(),
  };
}

async function galleryFor(seed: GallerySeed, published: boolean) {
  const created = await createGallery(
    {
      galleries: createDrizzleGalleryRepository(db),
      cipher,
      hasher: fakeHasher,
      newId: () => crypto.randomUUID(),
      now: new Date(),
    },
    seed.context,
    seed.ownerId,
    seed.bookedProjectId,
    { password: "mawar-4821", expiry: { type: "NONE" } },
  );
  if (!created.ok) throw new Error("create failed");
  await linkGallerySource(lifecycleDeps(), seed.context, seed.ownerId, created.galleryId, {
    workspaceSourceId: seed.sourceConfigId,
    link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
    label: "",
  });
  if (published)
    await publishGallery(lifecycleDeps(), seed.context, seed.ownerId, created.galleryId);
  return created.galleryId;
}

/** Cancels the project and archives its gallery in one transaction, as `withProjectCancellationScope` does. */
function cancelInOneTransaction(seed: GallerySeed, failAfterCancel: boolean) {
  return db.transaction(async (tx) => {
    const projects = createDrizzleProjectRepository(tx);
    const result = await cancelProject(projects, seed.context, seed.ownerId, seed.bookedProjectId, {
      reason: "",
    });
    if (result !== undefined) throw new Error("cancel refused");
    await archiveGalleryOfCancelledProject(
      { sources: createDrizzleGallerySourceRepository(tx), now: new Date() },
      seed.context,
      seed.ownerId,
      seed.bookedProjectId,
    );
    if (failAfterCancel) throw new Error("forced failure");
  });
}

async function states(seed: GallerySeed, galleryId: string) {
  const [p] = await db.select().from(project).where(eq(project.id, seed.bookedProjectId));
  const [g] = await db.select().from(gallery).where(eq(gallery.id, galleryId));
  return { project: p.status, gallery: g.status, archivedBy: g.archivedBy };
}

describe("cancelling a project with a gallery", () => {
  it("AC-GAL-024 cancels the project and archives its published gallery together", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await galleryFor(seed, true);
    await cancelInOneTransaction(seed, false);
    expect(await states(seed, galleryId)).toEqual({
      project: "CANCELLED",
      gallery: "ARCHIVED",
      archivedBy: seed.ownerId,
    });
  });

  it("AC-GAL-024 a failure after the archive rolls back both", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await galleryFor(seed, true);
    await expect(cancelInOneTransaction(seed, true)).rejects.toThrow("forced failure");
    expect(await states(seed, galleryId)).toEqual({
      project: "BOOKED",
      gallery: "PUBLISHED",
      archivedBy: null,
    });
  });

  it("A-8 AC-GAL-024 a draft gallery stays a draft on a cancelled project", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await galleryFor(seed, false);
    await cancelInOneTransaction(seed, false);
    expect(await states(seed, galleryId)).toEqual({
      project: "CANCELLED",
      gallery: "DRAFT",
      archivedBy: null,
    });
  });
});
