import {
  FakeDriveProvider,
  imageEntry,
  RINA_FOLDER_ID,
  SECOND_FOLDER_ID,
} from "@tests/support/gallery/fake-drive-provider";
import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { gallery, galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { findFolderUse } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { syncGallerySource } from "@/features/gallery/application/use-cases/sync-gallery-source/sync-gallery-source";

import { openTestDb } from "../helpers/test-db";
import { type GallerySeed, seedGalleryWorkspace } from "./helpers/gallery-seed";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const allow = { hit: () => Promise.resolve(true) };

function deps(provider: FakeDriveProvider) {
  return {
    sources: createDrizzleGallerySourceRepository(db),
    provider,
    rateLimiter: allow,
    now: new Date(),
  };
}

async function withGallery(seed: GallerySeed): Promise<string> {
  const created = await createGallery(
    {
      galleries: createDrizzleGalleryRepository(db),
      cipher: fakeCipher,
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
  return created.galleryId;
}

function linkValues(seed: GallerySeed, folderId = RINA_FOLDER_ID) {
  return {
    workspaceSourceId: seed.sourceConfigId,
    link: `https://drive.google.com/drive/folders/${folderId}`,
    label: "",
  };
}

async function link(
  seed: GallerySeed,
  galleryId: string,
  provider: FakeDriveProvider,
  folderId = RINA_FOLDER_ID,
) {
  const result = await linkGallerySource(
    deps(provider),
    seed.context,
    seed.ownerId,
    galleryId,
    linkValues(seed, folderId),
  );
  if (!result.ok) throw new Error(`link failed: ${result.code}`);
  return result;
}

function photosOf(sourceId: string) {
  return db.select().from(galleryPhoto).where(eq(galleryPhoto.gallerySourceId, sourceId));
}

describe("gallery sync against Postgres", () => {
  it("AC-GAL-005 links and syncs the fixture with its counts", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const linked = await link(seed, galleryId, FakeDriveProvider.withFixture());
    expect(linked.sync).toEqual({ ok: true, status: "SUCCEEDED" });
    const [source] = await db
      .select()
      .from(gallerySource)
      .where(eq(gallerySource.id, linked.sourceId));
    expect(source).toMatchObject({
      syncStatus: "SUCCEEDED",
      folderName: "Rina-Wisuda",
      proofCount: 4,
      editedCount: 3,
      printCount: 1,
      ignoredCount: 2,
      missingCount: 0,
    });
    const photos = await photosOf(linked.sourceId);
    expect(photos.find((photo) => photo.fileName === "X_001.jpg")).toMatchObject({
      kind: "EDITED",
      folderPath: "Edited/old",
      browsePath: "old",
    });
  });

  it("AC-GAL-006 two concurrent syncs and repeats leave exactly 8 photos", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const linked = await link(seed, galleryId, provider);
    const results = await Promise.all([
      syncGallerySource(deps(provider), seed.context, linked.sourceId),
      syncGallerySource(deps(provider), seed.context, linked.sourceId),
    ]);
    expect(results).toContainEqual({ ok: true, status: "SUCCEEDED" });
    await syncGallerySource(deps(provider), seed.context, linked.sourceId);
    expect(await photosOf(linked.sourceId)).toHaveLength(8);
  });

  it("AC-GAL-007 marks a removed file missing, then clears it when it returns", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const linked = await link(seed, galleryId, provider);
    const root = provider.tree.get(RINA_FOLDER_ID) ?? [];
    provider.tree.set(RINA_FOLDER_ID, [
      ...root.filter((entry) => entry.name !== "IMG_002.jpg"),
      imageEntry("IMG_011.jpg"),
    ]);
    await syncGallerySource(deps(provider), seed.context, linked.sourceId);
    const after = await photosOf(linked.sourceId);
    expect(after.find((photo) => photo.fileName === "IMG_002.jpg")?.missingAt).not.toBeNull();
    expect(after.find((photo) => photo.fileName === "IMG_011.jpg")?.kind).toBe("PROOF");
    const [source] = await db
      .select()
      .from(gallerySource)
      .where(eq(gallerySource.id, linked.sourceId));
    expect(source).toMatchObject({ missingCount: 1, proofCount: 4 });
    provider.tree.set(RINA_FOLDER_ID, root);
    await syncGallerySource(deps(provider), seed.context, linked.sourceId);
    const back = await photosOf(linked.sourceId);
    expect(back.find((photo) => photo.fileName === "IMG_002.jpg")?.missingAt).toBeNull();
  });

  it("AC-GAL-008 a failure keeps the earlier photos and records the reason", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const linked = await link(seed, galleryId, provider);
    provider.failures.set(RINA_FOLDER_ID, "NOT_PUBLIC");
    expect(await syncGallerySource(deps(provider), seed.context, linked.sourceId)).toEqual({
      ok: true,
      status: "FAILED",
      errorCode: "NOT_PUBLIC",
    });
    expect(await photosOf(linked.sourceId)).toHaveLength(8);
    const [source] = await db
      .select()
      .from(gallerySource)
      .where(eq(gallerySource.id, linked.sourceId));
    expect(source).toMatchObject({
      syncStatus: "FAILED",
      syncErrorCode: "NOT_PUBLIC",
      syncStartedAt: null,
    });
  });

  it("AC-GAL-010 refuses a folder twice and names another project using it", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    await link(seed, galleryId, provider);
    expect(
      await linkGallerySource(
        deps(provider),
        seed.context,
        seed.ownerId,
        galleryId,
        linkValues(seed),
      ),
    ).toMatchObject({
      fieldErrors: { link: "FOLDER_ALREADY_LINKED" },
    });
    await db
      .update(gallery)
      .set({ projectId: seed.bookedProjectId })
      .where(eq(gallery.id, galleryId));
    const use = await findFolderUse(
      createDrizzleGallerySourceRepository(db),
      seed.context,
      crypto.randomUUID(),
      linkValues(seed).link,
    );
    expect(use).toEqual({ ok: true, projectTitles: ["Wisuda Rina"] });
  });

  it("AC-GAL-012 one failing source doesn't affect another", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const first = await link(seed, galleryId, provider);
    const second = await link(seed, galleryId, provider, SECOND_FOLDER_ID);
    provider.failures.set(SECOND_FOLDER_ID, "UNAVAILABLE");
    await syncGallerySource(deps(provider), seed.context, second.sourceId);
    expect(await syncGallerySource(deps(provider), seed.context, first.sourceId)).toEqual({
      ok: true,
      status: "SUCCEEDED",
    });
    expect(await photosOf(second.sourceId)).toHaveLength(1);
  });

  it("AC-GAL-025 another workspace can't sync or link into the gallery", async () => {
    const seed = await seedGalleryWorkspace(db);
    const other = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const linked = await link(seed, galleryId, provider);
    await expect(
      syncGallerySource(deps(provider), other.context, linked.sourceId),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      linkGallerySource(
        deps(provider),
        other.context,
        other.ownerId,
        galleryId,
        linkValues(other, SECOND_FOLDER_ID),
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    const rows = await db
      .select()
      .from(gallerySource)
      .where(
        and(
          eq(gallerySource.galleryId, galleryId),
          eq(gallerySource.workspaceId, other.context.workspaceId),
        ),
      );
    expect(rows).toHaveLength(0);
  });
});
