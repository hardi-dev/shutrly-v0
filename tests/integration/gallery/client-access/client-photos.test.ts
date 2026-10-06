import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientGalleryReader } from "@/adapters/db/gallery-repository/drizzle-client-gallery-reader";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { gallerySource } from "@/adapters/db/schema/gallery/gallery";
import type { GallerySourceProviderPort } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import { browseClientPhotos } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos";
import { serveClientPhoto } from "@/features/gallery/application/use-cases/serve-client-photo/serve-client-photo";

import { openTestDb } from "../../helpers/test-db";
import { clientContextOf } from "./client-context";
import {
  type ClientAccessFixture,
  seedClientAccess,
  seedPhotos,
  seedProjectWithGallery,
} from "./fixture";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;
let target: { workspaceId: string; projectId: string; galleryId: string; token: string };
let ids: Record<string, string>;
let otherPhotoId: string;

const PROOFS = Array.from({ length: 9 }, (_, index) => `IMG_00${String(index + 1)}.jpg`);
const HIDDEN = ["IMG_010.jpg", "IMG_099.jpg", "E_001.jpg", "E_002.jpg", "P_001.jpg"];

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
  target = {
    workspaceId: fixture.context.workspaceId,
    projectId: fixture.projectId,
    galleryId: fixture.galleryId,
    token: fixture.t1,
  };
  const main = await seedPhotos(db, target, [
    ...PROOFS.map((fileName) => ({ fileName })),
    { fileName: "IMG_010.jpg", missing: true },
    { fileName: "E_001.jpg", kind: "EDITED" as const },
    { fileName: "E_002.jpg", kind: "EDITED" as const },
    { fileName: "P_001.jpg", kind: "PRINT" as const },
  ]);
  const removed = await seedPhotos(db, target, [{ fileName: "IMG_099.jpg" }]);
  await db
    .update(gallerySource)
    .set({ removedAt: new Date() })
    .where(eq(gallerySource.id, removed.sourceId));
  ids = { ...main.photoIds, ...removed.photoIds };
  const sari = await seedProjectWithGallery(db, {
    workspaceId: target.workspaceId,
    serviceId: fixture.serviceId,
    clientName: "Sari",
    title: "Wisuda Sari",
    status: "BOOKED",
  });
  otherPhotoId = (
    await seedPhotos(db, { workspaceId: target.workspaceId, galleryId: sari.galleryId }, [
      { fileName: "SARI_001.jpg" },
    ])
  ).photoIds["SARI_001.jpg"];
});
afterAll(() => close());

const browse = (query: Record<string, unknown>) =>
  browseClientPhotos(
    { browse: createDrizzleGalleryBrowseReader(db, { client: true }), directImages: true },
    clientContextOf(target),
    { kind: "EDITED", sourceId: null, path: "", search: "", cursor: null, ...query },
  );

describe("client photos (D-15)", () => {
  it("AC-ACC-011 shows only visible proofs in the page, its JSON and image URLs", async () => {
    const root = await browse({});
    expect(root.proofTotal).toBe(9);
    const page =
      root.mode === "FOLDER" ? root : await browse({ sourceId: root.folders[0]?.sourceId });
    expect(page.photos.map((photo) => photo.fileName)).toEqual(PROOFS);
    const json = JSON.stringify([root, page]);
    for (const name of HIDDEN) expect(json).not.toContain(name);
    expect(json).not.toContain("drive.google.com");
    expect(json).not.toContain("resourceKey");
    expect(page.photos[0].thumb.fallbackSrc).toBe(
      `/g/${target.token}/media/${ids["IMG_001.jpg"]}/thumb`,
    );
  });

  it("AC-ACC-011 finds no hidden photo by search", async () => {
    for (const text of ["IMG_010", "IMG_099", "E_00", "P_001"]) {
      const result = await browse({ search: text });
      expect(result.photos).toEqual([]);
    }
    expect((await browse({ search: "IMG_00" })).photos).toHaveLength(9);
  });

  it("AC-ACC-013 AC-ACC-006 serves the fallback only for photos this client may see", async () => {
    const thumbnail = vi.fn<GallerySourceProviderPort["thumbnail"]>(() =>
      Promise.resolve({ ok: true, body: new ReadableStream(), contentType: "image/jpeg" }),
    );
    const deps = {
      reader: createDrizzleClientGalleryReader(db),
      provider: { thumbnail } as unknown as GallerySourceProviderPort,
    };
    const serve = (photoId: string) =>
      serveClientPhoto(deps, clientContextOf(target), photoId, "thumb");
    expect((await serve(ids["IMG_001.jpg"])).ok).toBe(true);
    for (const name of HIDDEN) expect((await serve(ids[name])).ok).toBe(false);
    expect((await serve(otherPhotoId)).ok).toBe(false);
    expect(thumbnail).toHaveBeenCalledTimes(1);
  });

  it("AC-DEL-003 serves edited files once final delivery is published", async () => {
    const deps = {
      reader: createDrizzleClientGalleryReader(db),
      provider: {
        thumbnail: () =>
          Promise.resolve({ ok: true, body: new ReadableStream(), contentType: "image/jpeg" }),
      } as unknown as GallerySourceProviderPort,
    };
    const delivered = clientContextOf({ ...target, finalDeliveryPublished: true });
    expect((await serveClientPhoto(deps, delivered, ids["E_001.jpg"], "thumb")).ok).toBe(true);
    expect((await serveClientPhoto(deps, delivered, ids["IMG_010.jpg"], "thumb")).ok).toBe(false);
  });
});
