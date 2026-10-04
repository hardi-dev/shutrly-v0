import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { FakeDriveProvider, RINA_FOLDER_ID } from "@tests/support/gallery/fake-drive-provider";
import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { gallery, galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { archiveGallery } from "@/features/gallery/application/use-cases/archive-gallery/archive-gallery";
import { browseGalleryPhotos } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { deleteDraftGallery } from "@/features/gallery/application/use-cases/delete-draft-gallery/delete-draft-gallery";
import { findFolderUse } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use";
import { getGalleryCard } from "@/features/gallery/application/use-cases/get-gallery-card/get-gallery-card";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { proposeGalleryPassword } from "@/features/gallery/application/use-cases/propose-gallery-password/propose-gallery-password";
import { publishGallery } from "@/features/gallery/application/use-cases/publish-gallery/publish-gallery";
import { removeGallerySource } from "@/features/gallery/application/use-cases/remove-gallery-source/remove-gallery-source";
import { rotateGalleryPassword } from "@/features/gallery/application/use-cases/rotate-gallery-password/rotate-gallery-password";
import { serveOwnerPhoto } from "@/features/gallery/application/use-cases/serve-owner-photo/serve-owner-photo";
import { setGalleryExpiry } from "@/features/gallery/application/use-cases/set-gallery-expiry/set-gallery-expiry";
import { syncGallerySourceStep } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step";

import { openTestDb } from "../helpers/test-db";
import { seedGalleryWorkspace } from "./helpers/gallery-seed";
import { syncSourceToEnd } from "./helpers/sync-to-end";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const cipher = createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY);
const provider = FakeDriveProvider.withFixture();

function deps() {
  return {
    sources: createDrizzleGallerySourceRepository(db),
    provider,
    rateLimiter: { hit: () => Promise.resolve(true) },
    cipher,
    hasher: fakeHasher,
    now: new Date(),
  };
}

async function snapshot(galleryId: string, sourceId: string) {
  const [g] = await db.select().from(gallery).where(eq(gallery.id, galleryId));
  const [s] = await db.select().from(gallerySource).where(eq(gallerySource.id, sourceId));
  const photos = await db
    .select()
    .from(galleryPhoto)
    .where(eq(galleryPhoto.gallerySourceId, sourceId));
  return JSON.stringify({ g, s, photos: photos.length });
}

describe("AC-GAL-025 workspace isolation", () => {
  it("every gallery action and read answers not found for another workspace and changes nothing", async () => {
    const owner = await seedGalleryWorkspace(db);
    const intruder = await seedGalleryWorkspace(db);
    const created = await createGallery(
      {
        galleries: createDrizzleGalleryRepository(db),
        cipher,
        hasher: fakeHasher,
        newId: () => crypto.randomUUID(),
        now: new Date(),
      },
      owner.context,
      owner.ownerId,
      owner.bookedProjectId,
      { password: "mawar-4821", expiry: { type: "NONE" } },
    );
    if (!created.ok) throw new Error("create failed");
    const linked = await linkGallerySource(
      deps(),
      owner.context,
      owner.ownerId,
      created.galleryId,
      {
        workspaceSourceId: owner.sourceConfigId,
        link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
        label: "",
      },
    );
    if (!linked.ok) throw new Error("link failed");
    await syncSourceToEnd(deps(), owner.context, linked.sourceId);
    const photoRows = await db
      .select()
      .from(galleryPhoto)
      .where(eq(galleryPhoto.gallerySourceId, linked.sourceId));
    const before = await snapshot(created.galleryId, linked.sourceId);
    const repository = createDrizzleGalleryRepository(db);
    const { galleryId } = created;
    const { sourceId } = linked;
    const attempts: Record<string, () => Promise<unknown>> = {
      propose: () =>
        proposeGalleryPassword(repository, () => 0, intruder.context, owner.bookedProjectId),
      card: () =>
        getGalleryCard(repository, cipher, intruder.context, owner.bookedProjectId, new Date()),
      browse: () =>
        browseGalleryPhotos(createDrizzleGalleryBrowseReader(db), intruder.context, galleryId, {
          kind: "PROOF",
          sourceId: null,
          path: "",
          search: "",
          cursor: null,
        }),
      folderUse: async () => {
        const use = await findFolderUse(
          deps().sources,
          intruder.context,
          galleryId,
          `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
        );
        if (use.ok && use.projectTitles.length === 0)
          throw Object.assign(new Error("none"), { code: "NOT_FOUND" });
        return use;
      },
      link: () =>
        linkGallerySource(deps(), intruder.context, intruder.ownerId, galleryId, {
          workspaceSourceId: intruder.sourceConfigId,
          link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
          label: "",
        }),
      sync: () => syncGallerySourceStep(deps(), intruder.context, sourceId),
      publish: () => publishGallery(deps(), intruder.context, intruder.ownerId, galleryId),
      expiry: () =>
        setGalleryExpiry(deps(), intruder.context, intruder.ownerId, galleryId, {
          expiry: { type: "NONE" },
        }),
      rotate: () =>
        rotateGalleryPassword(deps(), intruder.context, intruder.ownerId, galleryId, {
          password: "baru2026",
        }),
      remove: () => removeGallerySource(deps(), intruder.context, intruder.ownerId, sourceId),
      archive: () => archiveGallery(deps(), intruder.context, intruder.ownerId, galleryId),
      delete: () => deleteDraftGallery(deps(), intruder.context, galleryId),
    };
    for (const [name, attempt] of Object.entries(attempts)) {
      await expect(attempt(), name).rejects.toMatchObject({ code: "NOT_FOUND" });
    }
    const media = await serveOwnerPhoto(
      { galleries: repository, provider },
      intruder.context,
      photoRows[0].id,
      "thumb",
    );
    expect(media).toEqual({ ok: false });
    expect(await snapshot(galleryId, sourceId)).toBe(before);
  });
});
