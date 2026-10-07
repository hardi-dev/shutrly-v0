import { eq, sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createWorkersClientListCache } from "@/adapters/cache/workers-client-list-cache/workers-client-list-cache";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { runFinalDeliveryTransaction } from "@/composition/gallery/final-delivery-scope/final-delivery-scope";
import { browseClientPhotos } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos";

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

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

/** An in-memory stand-in for `caches.default`, shared by the requests of one test. */
function memoryEdgeCache() {
  const store = new Map<string, string>();
  return {
    match: (request: Request) =>
      Promise.resolve(store.has(request.url) ? new Response(store.get(request.url)) : undefined),
    put: async (request: Request, response: Response) => {
      store.set(request.url, await response.text());
    },
  };
}

const ROOT = { kind: "PROOF", sourceId: null, path: "", search: "", cursor: null };
const EDITED = { ...ROOT, kind: "EDITED" };

async function contentVersionOf(galleryId: string) {
  const [row] = await db
    .select({ version: gallery.contentVersion })
    .from(gallery)
    .where(eq(gallery.id, galleryId));
  return row.version;
}

async function seed() {
  const workspaceId = fixture.context.workspaceId;
  const rina = await seedProjectWithGallery(db, {
    workspaceId,
    serviceId: fixture.serviceId,
    clientName: "Rina",
    title: "Wisuda Rina",
    status: "POST_PROCESSING",
  });
  const target = { workspaceId, ...rina };
  await seedPhotos(db, target, [
    { fileName: "IMG_001.jpg" },
    { fileName: "E_001.jpg", kind: "EDITED" },
  ]);
  return target;
}

describe("client photo-list cache (D-22)", () => {
  it("D-22 serves the cached page until content_version moves, then reads fresh data", async () => {
    const target = await seed();
    const deps = {
      browse: createDrizzleGalleryBrowseReader(db, { client: true }),
      directImages: true,
      cache: createWorkersClientListCache(memoryEdgeCache()),
    };
    const clientAt = async () => ({
      ...clientContextOf(target),
      contentVersion: await contentVersionOf(target.galleryId),
    });
    const before = await browseClientPhotos(deps, await clientAt(), ROOT);
    expect(before.proofTotal).toBe(1);
    // A new file lands without a version change: the cached page is served.
    await seedPhotos(db, target, [{ fileName: "IMG_002.jpg" }]);
    expect((await browseClientPhotos(deps, await clientAt(), ROOT)).proofTotal).toBe(1);
    // A sync commit bumps content_version (gallery-sync-sql): the next read is fresh.
    await db
      .update(gallery)
      .set({ contentVersion: sql`${gallery.contentVersion} + 1` })
      .where(eq(gallery.id, target.galleryId));
    expect((await browseClientPhotos(deps, await clientAt(), ROOT)).proofTotal).toBe(2);
  });

  it("D-22 a final-delivery publish serves the finished files at once", async () => {
    const target = await seed();
    const deps = {
      browse: createDrizzleGalleryBrowseReader(db, { client: true }),
      directImages: true,
      cache: createWorkersClientListCache(memoryEdgeCache()),
    };
    const before = {
      ...clientContextOf(target),
      contentVersion: await contentVersionOf(target.galleryId),
    };
    expect((await browseClientPhotos(deps, before, EDITED)).editedTotal).toBe(0);
    expect(
      await runFinalDeliveryTransaction(db, {
        context: fixture.context,
        actorId: fixture.ownerId,
        projectId: target.projectId,
      }),
    ).toBeUndefined();
    const after = {
      ...clientContextOf({ ...target, finalDeliveryPublished: true }),
      contentVersion: await contentVersionOf(target.galleryId),
    };
    const page = await browseClientPhotos(deps, after, EDITED);
    expect(page.editedTotal).toBe(1);
    expect(page.photos.map((photo) => photo.fileName)).toContain("E_001.jpg");
  });

  it("C-103 a cached page carries no token: a rotated link gets its own media URLs", async () => {
    const target = await seed();
    const deps = {
      browse: createDrizzleGalleryBrowseReader(db, { client: true }),
      directImages: false,
      cache: createWorkersClientListCache(memoryEdgeCache()),
    };
    const version = await contentVersionOf(target.galleryId);
    await browseClientPhotos(deps, { ...clientContextOf(target), contentVersion: version }, ROOT);
    const rotated = {
      ...clientContextOf({ ...target, token: "N".repeat(43) }),
      contentVersion: version,
    };
    const page = await browseClientPhotos(deps, rotated, ROOT);
    expect(JSON.stringify(page)).not.toContain(target.token);
  });
});
