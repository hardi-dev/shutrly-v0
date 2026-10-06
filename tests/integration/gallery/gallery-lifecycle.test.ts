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
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { publishGallery } from "@/features/gallery/application/use-cases/publish-gallery/publish-gallery";
import { removeGallerySource } from "@/features/gallery/application/use-cases/remove-gallery-source/remove-gallery-source";
import { rotateGalleryPassword } from "@/features/gallery/application/use-cases/rotate-gallery-password/rotate-gallery-password";
import { setGalleryExpiry } from "@/features/gallery/application/use-cases/set-gallery-expiry/set-gallery-expiry";

import { openTestDb } from "../helpers/test-db";
import { type GallerySeed, seedGalleryWorkspace } from "./helpers/gallery-seed";
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
  await syncSourceToEnd(deps(), seed.context, linked.sourceId);
  return { galleryId: created.galleryId, sourceId: linked.sourceId };
}

async function galleryRow(galleryId: string) {
  const [row] = await db.select().from(gallery).where(eq(gallery.id, galleryId));
  return row;
}

describe("gallery lifecycle against Postgres", () => {
  it("AC-GAL-016 AC-GAL-018 AC-GAL-021 AC-GAL-022 publish, re-date, rotate and archive", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { galleryId, sourceId } = await linkedGallery(seed);
    expect(await publishGallery(deps(), seed.context, seed.ownerId, galleryId)).toEqual({
      ok: true,
    });
    const published = await galleryRow(galleryId);
    expect(published.status).toBe("PUBLISHED");
    expect(published.expiryDays).toBeNull();
    expect(published.expiresAt?.getTime()).toBeGreaterThan(Date.now() + 29 * 86_400_000);

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

    expect(await removeGallerySource(deps(), seed.context, seed.ownerId, sourceId)).toEqual({
      ok: false,
      code: "LAST_ACTIVE_SOURCE",
    });
    expect(await archiveGallery(deps(), seed.context, seed.ownerId, galleryId)).toEqual({
      ok: true,
    });
    expect(await galleryRow(galleryId)).toMatchObject({
      status: "ARCHIVED",
      archivedBy: seed.ownerId,
    });
    expect(await deleteDraftGallery(deps(), seed.context, galleryId)).toEqual({
      ok: false,
      code: "INVALID_STATE",
    });
  });

  it("AC-GAL-023 deletes a draft with its sources and photo records", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { galleryId, sourceId } = await linkedGallery(seed);
    expect(await deleteDraftGallery(deps(), seed.context, galleryId)).toEqual({ ok: true });
    expect(await db.select().from(gallery).where(eq(gallery.id, galleryId))).toHaveLength(0);
    expect(
      await db.select().from(gallerySource).where(eq(gallerySource.id, sourceId)),
    ).toHaveLength(0);
    expect(
      await db.select().from(galleryPhoto).where(eq(galleryPhoto.gallerySourceId, sourceId)),
    ).toHaveLength(0);
  });

  it("AC-GAL-013 a removed draft source keeps its photos on record", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { sourceId } = await linkedGallery(seed);
    expect(await removeGallerySource(deps(), seed.context, seed.ownerId, sourceId)).toEqual({
      ok: true,
    });
    const [source] = await db.select().from(gallerySource).where(eq(gallerySource.id, sourceId));
    expect(source.removedBy).toBe(seed.ownerId);
    expect(
      await db.select().from(galleryPhoto).where(eq(galleryPhoto.gallerySourceId, sourceId)),
    ).toHaveLength(8);
  });

  it("AC-GAL-036 the content version rises on each change a client could see, and not on an unchanged re-sync", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { galleryId, sourceId } = await linkedGallery(seed);
    const version = async () => (await galleryRow(galleryId)).contentVersion;
    expect(await version()).toBe(2);
    await syncSourceToEnd(deps(), seed.context, sourceId);
    expect(await version()).toBe(2);
    await publishGallery(deps(), seed.context, seed.ownerId, galleryId);
    expect(await version()).toBe(3);
    await setGalleryExpiry(deps(), seed.context, seed.ownerId, galleryId, {
      expiry: { type: "NONE" },
    });
    expect(await version()).toBe(4);
    await rotateGalleryPassword(deps(), seed.context, seed.ownerId, galleryId, {
      password: "baru2026",
    });
    expect(await version()).toBe(5);
    await archiveGallery(deps(), seed.context, seed.ownerId, galleryId);
    expect(await version()).toBe(6);
  });

  it("AC-GAL-036 removing a folder and a sync that finds a renamed file each bump the version", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { galleryId, sourceId } = await linkedGallery(seed);
    const second = await linkGallerySource(deps(), seed.context, seed.ownerId, galleryId, {
      workspaceSourceId: seed.sourceConfigId,
      link: `https://drive.google.com/drive/folders/${SECOND_FOLDER_ID}`,
      label: "",
    });
    if (!second.ok) throw new Error("link failed");
    await syncSourceToEnd(deps(), seed.context, second.sourceId);
    await publishGallery(deps(), seed.context, seed.ownerId, galleryId);
    const before = (await galleryRow(galleryId)).contentVersion;
    await removeGallerySource(deps(), seed.context, seed.ownerId, second.sourceId);
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
