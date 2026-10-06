import {
  FakeDriveProvider,
  folderEntry,
  imageEntry,
  RINA_FOLDER_ID,
  SECOND_FOLDER_ID,
} from "@tests/support/gallery/fake-drive-provider";
import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { and, eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { gallery, galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { createDrizzleWorkspaceSourceRepository } from "@/adapters/db/workspace-source-repository/drizzle-workspace-source-repository";
import { browseGalleryPhotos } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { findFolderUse } from "@/features/gallery/application/use-cases/find-folder-use/find-folder-use";
import { getGalleryCard } from "@/features/gallery/application/use-cases/get-gallery-card/get-gallery-card";
import { getGalleryPage } from "@/features/gallery/application/use-cases/get-gallery-page/get-gallery-page";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { serveOwnerPhoto } from "@/features/gallery/application/use-cases/serve-owner-photo/serve-owner-photo";
import { syncGallerySourceStep } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step";
import type { SyncStepOutcome } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step.types";

import { openTestDb } from "../helpers/test-db";
import { type GallerySeed, seedGalleryWorkspace } from "./helpers/gallery-seed";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const allow = { hit: () => Promise.resolve(true), peek: () => Promise.resolve(true) };

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

async function syncToEnd(
  provider: FakeDriveProvider,
  seed: GallerySeed,
  sourceId: string,
): Promise<SyncStepOutcome> {
  let outcome: SyncStepOutcome = { ok: false, code: "INVALID_STATE" };
  for (let step = 0; step < 50; step += 1) {
    outcome = await syncGallerySourceStep(deps(provider), seed.context, sourceId);
    if (!outcome.ok || outcome.status !== "CONTINUE") break;
  }
  return outcome;
}

function wideProvider(): FakeDriveProvider {
  const provider = FakeDriveProvider.withFixture();
  const root = [];
  for (let n = 1; n <= 94; n += 1) {
    root.push(folderEntry(`f${String(n)}`, `Sesi-${String(n)}`));
    provider.tree.set(`f${String(n)}`, [imageEntry(`S${String(n)}.jpg`)]);
  }
  provider.tree.set(RINA_FOLDER_ID, root);
  return provider;
}

async function versionsOf(sourceId: string): Promise<Map<string, string>> {
  const rows = await db
    .select({ id: galleryPhoto.id, version: sql<string>`xmin::text` })
    .from(galleryPhoto)
    .where(eq(galleryPhoto.gallerySourceId, sourceId));
  return new Map(rows.map((row) => [row.id, row.version]));
}

async function linkOnly(
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

async function link(
  seed: GallerySeed,
  galleryId: string,
  provider: FakeDriveProvider,
  folderId = RINA_FOLDER_ID,
) {
  const result = await linkOnly(seed, galleryId, provider, folderId);
  const sync = await syncToEnd(provider, seed, result.sourceId);
  return { ...result, sync };
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
      syncToEnd(provider, seed, linked.sourceId),
      syncToEnd(provider, seed, linked.sourceId),
    ]);
    expect(results).toContainEqual({ ok: true, status: "SUCCEEDED" });
    await syncToEnd(provider, seed, linked.sourceId);
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
    await syncToEnd(provider, seed, linked.sourceId);
    const after = await photosOf(linked.sourceId);
    expect(after.find((photo) => photo.fileName === "IMG_002.jpg")?.missingAt).not.toBeNull();
    expect(after.find((photo) => photo.fileName === "IMG_011.jpg")?.kind).toBe("PROOF");
    const [source] = await db
      .select()
      .from(gallerySource)
      .where(eq(gallerySource.id, linked.sourceId));
    expect(source).toMatchObject({ missingCount: 1, proofCount: 4 });
    provider.tree.set(RINA_FOLDER_ID, root);
    await syncToEnd(provider, seed, linked.sourceId);
    const back = await photosOf(linked.sourceId);
    expect(back.find((photo) => photo.fileName === "IMG_002.jpg")?.missingAt).toBeNull();
  });

  it("AC-GAL-008 a failure keeps the earlier photos and records the reason", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const linked = await link(seed, galleryId, provider);
    provider.failures.set(RINA_FOLDER_ID, "NOT_PUBLIC");
    expect(await syncToEnd(provider, seed, linked.sourceId)).toEqual({
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
    await syncToEnd(provider, seed, second.sourceId);
    expect(await syncToEnd(provider, seed, first.sourceId)).toEqual({
      ok: true,
      status: "SUCCEEDED",
    });
    expect(await photosOf(second.sourceId)).toHaveLength(1);
    const card = await getGalleryCard(
      createDrizzleGalleryRepository(db),
      fakeCipher,
      seed.context,
      seed.bookedProjectId,
      new Date(),
    );
    expect(card.gallery).toMatchObject({
      failedSourceCount: 1,
      failedSourceNames: ["Rina-Keluarga"],
    });
  });

  it("AC-GAL-025 another workspace can't sync or link into the gallery", async () => {
    const seed = await seedGalleryWorkspace(db);
    const other = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const linked = await link(seed, galleryId, provider);
    await expect(
      syncGallerySourceStep(deps(provider), other.context, linked.sourceId),
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

  it("AC-GAL-014 AC-GAL-015 previews proof first and serves media only to its workspace", async () => {
    const seed = await seedGalleryWorkspace(db);
    const other = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    await link(seed, galleryId, provider);
    const page = await getGalleryPage(
      createDrizzleGalleryRepository(db),
      createDrizzleWorkspaceSourceRepository(db),
      fakeCipher,
      seed.context,
      seed.bookedProjectId,
      new Date(),
    );
    expect(page.gallery.counts).toEqual({ proof: 4, edited: 3, print: 1, missing: 0 });
    expect(page.previewPhotos.map((photo) => photo.fileName)).toEqual([
      "IMG_001.jpg",
      "IMG_002.jpg",
      "IMG_010.jpg",
      "R_001.jpg",
      "E_001.jpg",
      "E_002.jpg",
      "X_001.jpg",
      "P_001.jpg",
    ]);
    expect(JSON.stringify(page)).not.toMatch(/googleusercontent|googleapis/);
    // The photo's provider comes from its workspace source, so a new provider needs no reader change.
    expect(page.previewPhotos.every((photo) => photo.provider === "GOOGLE_DRIVE")).toBe(true);
    const photoId = page.previewPhotos[0].id;
    const galleries = createDrizzleGalleryRepository(db);
    expect(
      await serveOwnerPhoto({ galleries, provider }, seed.context, photoId, "thumb"),
    ).toMatchObject({ ok: true });
    expect(await serveOwnerPhoto({ galleries, provider }, other.context, photoId, "thumb")).toEqual(
      { ok: false },
    );
  });

  it("AC-GAL-032 a 95-call tree runs in three steps and ends with the rows of one pass", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = wideProvider();
    const linked = await linkOnly(seed, galleryId, provider);
    const calls: number[] = [];
    let outcome: SyncStepOutcome = { ok: false, code: "INVALID_STATE" };
    for (let step = 0; step < 10; step += 1) {
      const before = provider.listCalls;
      outcome = await syncGallerySourceStep(deps(provider), seed.context, linked.sourceId);
      calls.push(provider.listCalls - before);
      if (!outcome.ok || outcome.status !== "CONTINUE") break;
    }
    expect(calls).toEqual([40, 40, 15]);
    expect(outcome).toEqual({ ok: true, status: "SUCCEEDED" });
    expect(await photosOf(linked.sourceId)).toHaveLength(94);
    const [source] = await db
      .select()
      .from(gallerySource)
      .where(eq(gallerySource.id, linked.sourceId));
    expect(source).toMatchObject({
      syncStatus: "SUCCEEDED",
      syncCursor: null,
      syncLeaseAt: null,
      proofCount: 94,
    });
  });

  it("AC-GAL-032 two steps of one run at the same time: one holds it, the other is refused", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = wideProvider();
    const linked = await linkOnly(seed, galleryId, provider);
    await syncGallerySourceStep(deps(provider), seed.context, linked.sourceId);
    await db
      .update(gallerySource)
      .set({ syncLeaseAt: new Date() })
      .where(eq(gallerySource.id, linked.sourceId));
    expect(await syncGallerySourceStep(deps(provider), seed.context, linked.sourceId)).toEqual({
      ok: false,
      code: "SYNC_IN_PROGRESS",
    });
    await db
      .update(gallerySource)
      .set({ syncLeaseAt: new Date(Date.now() - 3 * 60 * 1000) })
      .where(eq(gallerySource.id, linked.sourceId));
    expect(
      await syncGallerySourceStep(deps(provider), seed.context, linked.sourceId),
    ).toMatchObject({ ok: true, status: "CONTINUE" });
  });

  it("AC-GAL-032 a run older than 30 minutes restarts from the root", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = wideProvider();
    const linked = await linkOnly(seed, galleryId, provider);
    await syncGallerySourceStep(deps(provider), seed.context, linked.sourceId);
    await db
      .update(gallerySource)
      .set({ syncStartedAt: new Date(Date.now() - 31 * 60 * 1000), syncLeaseAt: null })
      .where(eq(gallerySource.id, linked.sourceId));
    expect(await syncGallerySourceStep(deps(provider), seed.context, linked.sourceId)).toEqual({
      ok: true,
      status: "CONTINUE",
      foldersDone: 40,
      foldersTotal: 95,
    });
  });

  it("AC-GAL-032 a run that fails in step 2 keeps step 1's rows and marks nothing missing", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = wideProvider();
    const linked = await link(seed, galleryId, provider);
    const before = await photosOf(linked.sourceId);
    provider.failures.set("f50", "UNAVAILABLE");
    expect((await syncToEnd(provider, seed, linked.sourceId)).ok).toBe(true);
    const after = await photosOf(linked.sourceId);
    expect(after).toHaveLength(before.length);
    expect(after.every((photo) => photo.missingAt === null)).toBe(true);
    const [source] = await db
      .select()
      .from(gallerySource)
      .where(eq(gallerySource.id, linked.sourceId));
    expect(source).toMatchObject({
      syncStatus: "FAILED",
      syncErrorCode: "UNAVAILABLE",
      syncCursor: null,
      syncLeaseAt: null,
    });
  });

  it("AC-GAL-033 an unchanged re-sync rewrites no photo row; a rename rewrites one", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const linked = await link(seed, galleryId, provider);
    const first = await versionsOf(linked.sourceId);
    await syncToEnd(provider, seed, linked.sourceId);
    expect(await versionsOf(linked.sourceId)).toEqual(first);
    const root = provider.tree.get(RINA_FOLDER_ID) ?? [];
    provider.tree.set(
      RINA_FOLDER_ID,
      root.map((entry) =>
        entry.name === "IMG_001.jpg" ? { ...entry, name: "IMG_001-baru.jpg" } : entry,
      ),
    );
    await syncToEnd(provider, seed, linked.sourceId);
    const second = await versionsOf(linked.sourceId);
    const changed = [...second].filter(([id, version]) => first.get(id) !== version);
    expect(changed).toHaveLength(1);
    expect(
      (await photosOf(linked.sourceId)).find((p) => p.fileName === "IMG_001-baru.jpg"),
    ).toBeDefined();
  });

  it("AC-GAL-035 no view, browse page or sync result carries the folder ID or its resource key", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await withGallery(seed);
    const provider = FakeDriveProvider.withFixture();
    const resourceKey = "0-SecretKeyOfTheFolder";
    const linked = await linkGallerySource(deps(provider), seed.context, seed.ownerId, galleryId, {
      workspaceSourceId: seed.sourceConfigId,
      link: `https://drive.google.com/drive/folders/${RINA_FOLDER_ID}?resourcekey=${resourceKey}`,
      label: "",
    });
    if (!linked.ok) throw new Error("link failed");
    const outcome = await syncToEnd(provider, seed, linked.sourceId);
    const page = await getGalleryPage(
      createDrizzleGalleryRepository(db),
      createDrizzleWorkspaceSourceRepository(db),
      fakeCipher,
      seed.context,
      seed.bookedProjectId,
      new Date(),
    );
    const reader = createDrizzleGalleryBrowseReader(db);
    const browse = await browseGalleryPhotos(reader, seed.context, galleryId, {
      kind: "PROOF",
      sourceId: null,
      path: "",
      search: "",
      cursor: null,
    });
    const shown = JSON.stringify([linked, outcome, page, browse]);
    expect(shown).not.toContain(RINA_FOLDER_ID);
    expect(shown).not.toContain(resourceKey);
    expect(shown).toContain("file-IMG_001.jpg");
  });
});
