import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { FakeDriveProvider, RINA_FOLDER_ID } from "@tests/support/gallery/fake-drive-provider";
import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { project } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { cancelProject } from "@/features/booking/application/use-cases/cancel-project/cancel-project";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";

import { openTestDb } from "../helpers/test-db";
import { createBookedGallery } from "./helpers/booked-gallery";
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

async function galleryFor(seed: GallerySeed) {
  const { galleryId, result } = await createBookedGallery(
    db,
    { cipher, hasher: fakeHasher },
    seed.context,
    seed.ownerId,
    seed.bookedProjectId,
  );
  if (!result.ok) throw new Error("create failed");
  await linkGallerySource(lifecycleDeps(), seed.context, seed.ownerId, galleryId, {
    workspaceSourceId: seed.sourceConfigId,
    link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
    label: "",
  });
  return galleryId;
}

/** Cancels the project in one transaction, as `cancelProjectEntry` does; the gallery is not written (AC-GFL-016). */
function cancelInOneTransaction(seed: GallerySeed, failAfterCancel: boolean) {
  return db.transaction(async (tx) => {
    const projects = createDrizzleProjectRepository(tx);
    const result = await cancelProject(projects, seed.context, seed.ownerId, seed.bookedProjectId, {
      reason: "",
    });
    if (result !== undefined) throw new Error("cancel refused");
    if (failAfterCancel) throw new Error("forced failure");
  });
}

async function states(seed: GallerySeed, galleryId: string) {
  const [p] = await db.select().from(project).where(eq(project.id, seed.bookedProjectId));
  const [g] = await db.select().from(gallery).where(eq(gallery.id, galleryId));
  return { project: p.status, galleryContentVersion: g.contentVersion };
}

describe("cancelling a project with a gallery", () => {
  // AC-GFL-016 supersedes AC-GAL-024: the gallery closes by its derived state, nothing is archived.
  it("AC-GFL-016 cancels the project and leaves its gallery unwritten", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await galleryFor(seed);
    await cancelInOneTransaction(seed, false);
    expect(await states(seed, galleryId)).toEqual({
      project: "CANCELLED",
      galleryContentVersion: 1,
    });
  });

  it("AC-GAL-024 a failure after the cancel rolls back the project", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await galleryFor(seed);
    await expect(cancelInOneTransaction(seed, true)).rejects.toThrow("forced failure");
    expect(await states(seed, galleryId)).toEqual({
      project: "BOOKED",
      galleryContentVersion: 1,
    });
  });
});
