import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { createWorkersClientListCache } from "@/adapters/cache/workers-client-list-cache/workers-client-list-cache";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientGalleryReader } from "@/adapters/db/gallery-repository/drizzle-client-gallery-reader";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { gallery, galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import { runFinalDeliveryTransaction } from "@/composition/gallery/final-delivery-scope/final-delivery-scope";
import type { GallerySourceProviderPort } from "@/features/gallery/application/ports/gallery-source-provider/gallery-source-provider.port";
import { browseClientPhotos } from "@/features/gallery/application/use-cases/browse-client-photos/browse-client-photos";
import { getClientHome } from "@/features/gallery/application/use-cases/get-client-home/get-client-home";
import { getDeliveryFiles } from "@/features/gallery/application/use-cases/get-delivery-files/get-delivery-files";
import { getPickView } from "@/features/gallery/application/use-cases/get-pick-view/get-pick-view";
import { getReview } from "@/features/gallery/application/use-cases/get-review/get-review";
import { listPickTargets } from "@/features/gallery/application/use-cases/list-pick-targets/list-pick-targets";
import { serveClientFile } from "@/features/gallery/application/use-cases/serve-client-file/serve-client-file";
import { setPick } from "@/features/gallery/application/use-cases/set-pick/set-pick";
import { setPickNote } from "@/features/gallery/application/use-cases/set-pick-note/set-pick-note";
import { submitSelectionGroup } from "@/features/gallery/application/use-cases/submit-selection-group/submit-selection-group";

import { openTestDb } from "../../helpers/test-db";
import { type ClientAccessFixture, GALLERY_PASSWORD, seedClientAccess } from "./fixture";
import { seedWorld, type World } from "./selection-world";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

const CIPHERTEXT = "ciphertext-sweep-1f2e3d";
const IV = "iv-sweep-9a8b7c";
const RESOURCE_KEY = "0-resourcekey-sweep";

const provider = {
  download: vi.fn(() =>
    Promise.resolve({
      ok: true as const,
      body: new ReadableStream(),
      contentType: "image/jpeg",
      contentLength: null,
    }),
  ),
} as unknown as GallerySourceProviderPort;

function scopeOf() {
  return {
    selections: createDrizzleSelectionRepository(db),
    rateLimiter: createNeonRateLimiter(db),
    browse: createDrizzleGalleryBrowseReader(db, { client: true }),
    reader: createDrizzleClientGalleryReader(db),
    provider,
    directImages: true,
    cache: createWorkersClientListCache(null),
    now: new Date(),
  };
}

/** Gives the world's gallery secrets that are easy to spot in a response. */
async function plantSecrets(w: World) {
  await db
    .update(gallery)
    .set({ passwordCiphertext: CIPHERTEXT, passwordIv: IV })
    .where(eq(gallery.id, w.client.galleryId));
  await db
    .update(gallerySource)
    .set({ resourceKey: RESOURCE_KEY })
    .where(eq(gallerySource.galleryId, w.client.galleryId));
  await db
    .update(galleryPhoto)
    .set({ resourceKey: RESOURCE_KEY })
    .where(eq(galleryPhoto.galleryId, w.client.galleryId));
  const [row] = await db
    .select({ hash: gallery.passwordHash })
    .from(gallery)
    .where(eq(gallery.id, w.client.galleryId));
  const [source] = await db
    .select({ folderId: gallerySource.providerFolderId })
    .from(gallerySource)
    .where(eq(gallerySource.galleryId, w.client.galleryId));
  return [
    source.folderId,
    `drive.google.com/drive/folders/${source.folderId}`,
    RESOURCE_KEY,
    TEST_APP_ENV.GOOGLE_DRIVE_API_KEY,
    GALLERY_PASSWORD,
    row.hash,
    CIPHERTEXT,
    IV,
  ];
}

async function everyClientResult(w: World) {
  const scope = scopeOf();
  const query = (kind: string) => ({ kind, sourceId: null, path: "", search: "", cursor: null });
  const pick = await setPick(scope, w.client, {
    groupId: w.edit,
    photoId: w.photo["IMG_001.jpg"],
    quantity: 1,
  });
  const note = await setPickNote(scope, w.client, {
    groupId: w.edit,
    photoId: w.photo["IMG_001.jpg"],
    note: "Tolong cerahkan",
  });
  const before = {
    home: await getClientHome(scope, w.client),
    browse: await browseClientPhotos(scope, w.client, query("PROOF")),
    search: await browseClientPhotos(scope, w.client, { ...query("PROOF"), search: "IMG" }),
    targets: await listPickTargets(scope, w.client),
    pickView: await getPickView(scope, w.client, w.edit),
    review: await getReview(scope, w.client, w.edit),
    pick,
    note,
    submit: await submitSelectionGroup(
      scope,
      w.client,
      { groupId: w.edit, confirmBelowLimit: true },
      new Date(),
    ),
  };
  await runFinalDeliveryTransaction(db, {
    context: fixture.context,
    actorId: fixture.ownerId,
    projectId: w.client.projectId,
  });
  const delivered = { ...w.client, finalDeliveryPublished: true };
  const served = await serveClientFile(scope, delivered, w.photo["E_001.jpg"]);
  const after = {
    home: await getClientHome(scope, delivered),
    edited: await browseClientPhotos(scope, delivered, query("EDITED")),
    files: await getDeliveryFiles(scope, delivered),
    served: { ...served, body: undefined },
  };
  return { before, after };
}

describe("secrets sweep (AC-ACC-012, BR-ACC-005, C-103)", () => {
  it("AC-ACC-012 no client view or action result carries a folder ID or link, resource key, API key, password, hash or ciphertext", async () => {
    const w = await seedWorld(db, fixture);
    const secrets = await plantSecrets(w);
    const text = JSON.stringify(await everyClientResult(w));
    expect(text).toContain("IMG_001.jpg");
    expect(text).toContain("E_001.jpg");
    for (const secret of secrets) expect(text).not.toContain(secret);
  });

  it("AC-ACC-012 client pages and actions are private, no-store and not indexed; only the image route may sit in the private cache", async () => {
    vi.stubEnv("NETLIFY", "1");
    const { default: config } = await import("../../../../next.config");
    vi.unstubAllEnvs();
    const rules = (await config.headers?.()) ?? [];
    const valueOf = (source: string, key: string) =>
      rules.find((rule) => rule.source === source)?.headers.find((header) => header.key === key)
        ?.value;
    expect(valueOf("/g/:path*", "Cache-Control")).toBe("private, no-store");
    expect(valueOf("/g/:path*", "X-Robots-Tag")).toBe("noindex");
    expect(valueOf("/g/:token/media/:path*", "Cache-Control")).toBe("private, max-age=600");
  });
});
