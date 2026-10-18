import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import {
  FakeDriveProvider,
  RINA_FOLDER_ID,
  SECOND_FOLDER_ID,
} from "@tests/support/gallery/fake-drive-provider";
import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { gallery, galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { archiveGallery } from "@/features/gallery/application/use-cases/archive-gallery/archive-gallery";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { deleteDraftGallery } from "@/features/gallery/application/use-cases/delete-draft-gallery/delete-draft-gallery";
import { deleteGallerySource } from "@/features/gallery/application/use-cases/delete-gallery-source/delete-gallery-source";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { rotateGalleryPassword } from "@/features/gallery/application/use-cases/rotate-gallery-password/rotate-gallery-password";
import { setGalleryExpiry } from "@/features/gallery/application/use-cases/set-gallery-expiry/set-gallery-expiry";

import { openTestDb } from "../helpers/test-db";
import { type GallerySeed, seedGalleryWorkspace } from "./helpers/gallery-seed";
import { mapFixtureFolders } from "./helpers/map-fixture-folders";
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
    rateLimiter: { hit: () => Promise.resolve(true), peek: () => Promise.resolve(true) },
    cipher,
    hasher: fakeHasher,
    now: new Date(),
  };
}

async function linkedGallery(seed: GallerySeed) {
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
    { password: "mawar-4821", expiry: { type: "DAYS", days: 30 } },
  );
  if (!created.ok) throw new Error("create failed");
  const linked = await linkGallerySource(deps(), seed.context, seed.ownerId, created.galleryId, {
    workspaceSourceId: seed.sourceConfigId,
    link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
    label: "",
  });
  if (!linked.ok) throw new Error("link failed");
  await mapFixtureFolders(db, seed.context, linked.sourceId);
  await syncSourceToEnd(deps(), seed.context, linked.sourceId);
  return { galleryId: created.galleryId, sourceId: linked.sourceId };
}

async function galleryRow(galleryId: string) {
  const [row] = await db.select().from(gallery).where(eq(gallery.id, galleryId));
  return row;
}

describe("gallery lifecycle against Postgres", () => {
  // AC-GFL-006 supersedes AC-GAL-016 (publish) and AC-GAL-022 (archive): the gallery opens with its
  // project, so there is nothing to publish, and archive is refused.
  it("AC-GAL-018 AC-GAL-021 re-date and rotate an open gallery; archive is refused", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { galleryId, sourceId } = await linkedGallery(seed);
    const opened = await galleryRow(galleryId);
    expect(opened.status).toBeNull();
    expect(opened.expiryDays).toBeNull();
    expect(opened.expiresAt?.getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);

    expect(
      await setGalleryExpiry(deps(), seed.context, seed.ownerId, galleryId, {
        expiry: { type: "NONE" },
      }),
    ).toEqual({ ok: true, reopened: false });
    expect((await galleryRow(galleryId)).expiresAt).toBeNull();

    expect(
      await rotateGalleryPassword(deps(), seed.context, seed.ownerId, galleryId, {
        password: "baru2026",
      }),
    ).toEqual({ ok: true });
    const rotated = await galleryRow(galleryId);
    expect(rotated).toMatchObject({ passwordVersion: 2, passwordChangedBy: seed.ownerId });
    expect(rotated.passwordChangedAt).not.toBeNull();
    expect(JSON.stringify({ ...rotated, passwordHash: null })).not.toContain("baru2026");

    expect(await deleteGallerySource(deps(), seed.context, sourceId)).toEqual({
      ok: false,
      code: "LAST_ACTIVE_SOURCE",
    });
    expect(await archiveGallery(deps(), seed.context, seed.ownerId, galleryId)).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    expect(await galleryRow(galleryId)).toMatchObject({ status: null, archivedBy: null });
  });

  it("AC-GAL-001 Revision OT #3 creates a gallery with its first folder, or nothing when the source is inactive", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryDeps = () => ({
      galleries: createDrizzleGalleryRepository(db),
      cipher,
      hasher: fakeHasher,
      newId: () => crypto.randomUUID(),
      now: new Date(),
    });
    const input = (workspaceSourceId: string) => ({
      password: "mawar-4821",
      expiry: { type: "NONE" },
      folder: {
        workspaceSourceId,
        link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}`,
        label: "",
      },
    });
    const refused = await createGallery(
      galleryDeps(),
      seed.context,
      seed.ownerId,
      seed.bookedProjectId,
      input(crypto.randomUUID()),
    );
    expect(refused).toEqual({
      ok: false,
      code: "VALIDATION_FAILED",
      fieldErrors: { "folder.workspaceSourceId": "SOURCE_NOT_ACTIVE" },
    });
    expect(
      await db.select().from(gallery).where(eq(gallery.projectId, seed.bookedProjectId)),
    ).toHaveLength(0);
    const created = await createGallery(
      galleryDeps(),
      seed.context,
      seed.ownerId,
      seed.bookedProjectId,
      input(seed.sourceConfigId),
    );
    if (!created.ok) throw new Error("create failed");
    const [source] = await db
      .select()
      .from(gallerySource)
      .where(eq(gallerySource.galleryId, created.galleryId));
    expect(source).toMatchObject({ id: created.sourceId, providerFolderId: RINA_FOLDER_ID });
    await syncSourceToEnd(deps(), seed.context, source.id);
    expect(
      await db.select().from(galleryPhoto).where(eq(galleryPhoto.gallerySourceId, source.id)),
    ).toHaveLength(8);
  });

  // AC-GFL-006 supersedes AC-GAL-023: there are no drafts, so a gallery and its folders stay.
  it("AC-GFL-006 refuses to delete a gallery; its sources and photo records stay", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { galleryId, sourceId } = await linkedGallery(seed);
    expect(await deleteDraftGallery(deps(), seed.context, galleryId)).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
    expect(await db.select().from(gallery).where(eq(gallery.id, galleryId))).toHaveLength(1);
    expect(
      await db.select().from(gallerySource).where(eq(gallerySource.id, sourceId)),
    ).toHaveLength(1);
  });

  it("AC-GAL-036 the content version rises on each change a client could see, and not on an unchanged re-sync", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { galleryId, sourceId } = await linkedGallery(seed);
    const version = async () => (await galleryRow(galleryId)).contentVersion;
    expect(await version()).toBe(2);
    await syncSourceToEnd(deps(), seed.context, sourceId);
    expect(await version()).toBe(2);
    // No publish step (AC-GFL-006): publishing and archiving no longer bump the version (D-15).
    await setGalleryExpiry(deps(), seed.context, seed.ownerId, galleryId, {
      expiry: { type: "NONE" },
    });
    expect(await version()).toBe(3);
    await rotateGalleryPassword(deps(), seed.context, seed.ownerId, galleryId, {
      password: "baru2026",
    });
    expect(await version()).toBe(4);
    await archiveGallery(deps(), seed.context, seed.ownerId, galleryId);
    expect(await version()).toBe(4);
  });

  it("AC-GAL-036 deleting a folder and a sync that finds a renamed file each bump the version", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { galleryId, sourceId } = await linkedGallery(seed);
    const second = await linkGallerySource(deps(), seed.context, seed.ownerId, galleryId, {
      workspaceSourceId: seed.sourceConfigId,
      link: `https://drive.google.com/drive/folders/${SECOND_FOLDER_ID}`,
      label: "",
    });
    if (!second.ok) throw new Error("link failed");
    await syncSourceToEnd(deps(), seed.context, second.sourceId);
    const before = (await galleryRow(galleryId)).contentVersion;
    await deleteGallerySource(deps(), seed.context, second.sourceId);
    expect((await galleryRow(galleryId)).contentVersion).toBe(before + 1);
    const root = provider.tree.get(RINA_FOLDER_ID) ?? [];
    provider.tree.set(
      RINA_FOLDER_ID,
      root.map((entry) =>
        entry.name === "IMG_001.jpg" ? { ...entry, name: "IMG_001-b.jpg" } : entry,
      ),
    );
    await syncSourceToEnd(deps(), seed.context, sourceId);
    expect((await galleryRow(galleryId)).contentVersion).toBe(before + 2);
    provider.tree.set(RINA_FOLDER_ID, root);
  });
});
