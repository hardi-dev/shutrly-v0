import {
  FakeDriveProvider,
  folderEntry,
  imageEntry,
} from "@tests/support/gallery/fake-drive-provider";
import { fakeCipher, fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { browseGalleryPhotos } from "@/features/gallery/application/use-cases/browse-gallery-photos/browse-gallery-photos";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";

import { openTestDb } from "../helpers/test-db";
import { type GallerySeed, seedGalleryWorkspace } from "./helpers/gallery-seed";
import { syncSourceToEnd } from "./helpers/sync-to-end";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const names = (prefix: string, count: number, start = 1) =>
  Array.from({ length: count }, (_, index) =>
    imageEntry(`${prefix}_${String(index + start).padStart(3, "0")}.jpg`),
  );

async function galleryWith(seed: GallerySeed, provider: FakeDriveProvider, folderIds: string[]) {
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
  const deps = {
    sources: createDrizzleGallerySourceRepository(db),
    provider,
    rateLimiter: { hit: () => Promise.resolve(true) },
    now: new Date(),
  };
  const sourceIds: string[] = [];
  for (const folderId of folderIds) {
    const linked = await linkGallerySource(deps, seed.context, seed.ownerId, created.galleryId, {
      workspaceSourceId: seed.sourceConfigId,
      link: `https://drive.google.com/drive/folders/${folderId}`,
      label: "",
    });
    if (!linked.ok) throw new Error("link failed");
    await syncSourceToEnd(deps, seed.context, linked.sourceId);
    sourceIds.push(linked.sourceId);
  }
  return { galleryId: created.galleryId, sourceIds };
}

const query = (extra: Record<string, unknown> = {}) => ({
  kind: "PROOF",
  sourceId: null,
  path: "",
  search: "",
  cursor: null,
  ...extra,
});

describe("gallery browse reader", () => {
  it("AC-GAL-028 tabs, one tile per source, 48-photo pages and search", async () => {
    const seed = await seedGalleryWorkspace(db);
    const provider = new FakeDriveProvider();
    provider.names.set("1RinaWisudaBig0", "Rina-Wisuda");
    provider.names.set("1RinaKeluargaBig", "Rina-Keluarga");
    provider.tree.set("1RinaWisudaBig0", [
      ...names("IMG", 212),
      folderEntry("big-edited", "edited"),
    ]);
    provider.tree.set("big-edited", names("E", 40));
    provider.tree.set("1RinaKeluargaBig", names("K", 100));
    const { galleryId, sourceIds } = await galleryWith(seed, provider, [
      "1RinaWisudaBig0",
      "1RinaKeluargaBig",
    ]);
    const reader = createDrizzleGalleryBrowseReader(db);

    const top = await browseGalleryPhotos(reader, seed.context, galleryId, query());
    expect(top.totals).toEqual({ proof: 312, edited: 40, print: 0 });
    expect(top.mode).toBe("SOURCES");
    expect(top.folders.map((folder) => `${folder.name} · ${String(folder.count)}`)).toEqual([
      "Rina-Wisuda · 212",
      "Rina-Keluarga · 100",
    ]);

    const first = await browseGalleryPhotos(
      reader,
      seed.context,
      galleryId,
      query({ sourceId: sourceIds[0] }),
    );
    expect(first.photos).toHaveLength(48);
    expect(first.photos[0].fileName).toBe("IMG_001.jpg");
    expect(first.summary).toEqual({ folderCount: 0, photoCount: 212 });
    let cursor = first.nextCursor;
    let seen = first.photos.length;
    while (cursor !== null) {
      const next = await browseGalleryPhotos(
        reader,
        seed.context,
        galleryId,
        query({ sourceId: sourceIds[0], cursor }),
      );
      seen += next.photos.length;
      cursor = next.nextCursor;
    }
    expect(seen).toBe(212);

    const search = await browseGalleryPhotos(
      reader,
      seed.context,
      galleryId,
      query({ search: "img_02" }),
    );
    expect(search.mode).toBe("SEARCH");
    expect(search.photos.map((photo) => photo.fileName)).toEqual(
      Array.from({ length: 10 }, (_, i) => `IMG_02${String(i)}.jpg`),
    );
    const none = await browseGalleryPhotos(
      reader,
      seed.context,
      galleryId,
      query({ search: "IMG_99" }),
    );
    expect(none.photos).toEqual([]);
    expect(none.summary?.photoCount).toBe(0);
  });

  it("AC-GAL-030 subfolders browse like Drive, edited folded into Akad, single source opens directly", async () => {
    const seed = await seedGalleryWorkspace(db);
    const provider = new FakeDriveProvider();
    provider.names.set("1RinaWisudaAkad0", "Rina-Wisuda");
    provider.tree.set("1RinaWisudaAkad0", [
      imageEntry("IMG_001.jpg"),
      folderEntry("akad", "Akad"),
      folderEntry("resepsi", "Resepsi"),
    ]);
    provider.tree.set("akad", [imageEntry("A_001.jpg"), folderEntry("akad-edited", "edited")]);
    provider.tree.set("akad-edited", [imageEntry("AE_001.jpg")]);
    provider.tree.set("resepsi", [imageEntry("R_010.jpg")]);
    const { galleryId } = await galleryWith(seed, provider, ["1RinaWisudaAkad0"]);
    const reader = createDrizzleGalleryBrowseReader(db);

    const proof = await browseGalleryPhotos(reader, seed.context, galleryId, query());
    expect(proof.isSingleSource).toBe(true);
    expect(proof.folders.map((folder) => `${folder.name} · ${String(folder.count)}`)).toEqual([
      "Akad · 1",
      "Resepsi · 1",
    ]);
    expect(proof.photos.map((photo) => photo.fileName)).toEqual(["IMG_001.jpg"]);

    const akad = await browseGalleryPhotos(
      reader,
      seed.context,
      galleryId,
      query({ sourceId: proof.sourceId, path: "Akad" }),
    );
    expect(akad.photos.map((photo) => photo.fileName)).toEqual(["A_001.jpg"]);

    const edited = await browseGalleryPhotos(
      reader,
      seed.context,
      galleryId,
      query({ kind: "EDITED" }),
    );
    expect(edited.folders.map((folder) => folder.name)).toEqual(["Akad"]);
    const inside = await browseGalleryPhotos(
      reader,
      seed.context,
      galleryId,
      query({ kind: "EDITED", sourceId: edited.sourceId, path: "Akad" }),
    );
    expect(inside.photos.map((photo) => photo.fileName)).toEqual(["AE_001.jpg"]);
  });

  it("AC-GAL-025 another workspace gets not found", async () => {
    const seed = await seedGalleryWorkspace(db);
    const other = await seedGalleryWorkspace(db);
    const { galleryId } = await galleryWith(seed, FakeDriveProvider.withFixture(), []);
    await expect(
      browseGalleryPhotos(createDrizzleGalleryBrowseReader(db), other.context, galleryId, query()),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
