import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createBetterAuthPasswordHasher } from "@/adapters/crypto/password-hasher/better-auth-password-hasher";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { gallery, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import { getGalleryCard } from "@/features/gallery/application/use-cases/get-gallery-card/get-gallery-card";
import { getGalleryPage } from "@/features/gallery/application/use-cases/get-gallery-page/get-gallery-page";

import { openTestDb } from "../helpers/test-db";
import { seedGalleryWorkspace } from "./helpers/gallery-seed";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const cipher = createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY);
const NOW = new Date();
const VALUES = { password: "mawar-4821", expiry: { type: "NONE" } };

function deps() {
  return {
    galleries: createDrizzleGalleryRepository(db),
    cipher,
    hasher: createBetterAuthPasswordHasher(),
    newId: () => crypto.randomUUID(),
    now: NOW,
  };
}

describe("drizzle gallery repository", () => {
  it("AC-GAL-001 AC-GAL-027 stores the password only as ciphertext and hash, version 1", async () => {
    const seed = await seedGalleryWorkspace(db);
    const result = await createGallery(
      deps(),
      seed.context,
      seed.ownerId,
      seed.bookedProjectId,
      VALUES,
    );
    expect(result.ok).toBe(true);
    const [row] = await db
      .select()
      .from(gallery)
      .where(eq(gallery.projectId, seed.bookedProjectId));
    expect(row).toMatchObject({ status: "DRAFT", passwordVersion: 1, passwordKeyVersion: 1 });
    expect(JSON.stringify(row)).not.toContain("mawar-4821");
    const page = await getGalleryPage(
      createDrizzleGalleryRepository(db),
      cipher,
      seed.context,
      seed.bookedProjectId,
      NOW,
    );
    expect(page.gallery.password).toBe("mawar-4821");
    expect(page.sources).toEqual([]);
  });

  it("AC-GAL-004 two concurrent creates leave exactly one gallery", async () => {
    const seed = await seedGalleryWorkspace(db);
    const results = await Promise.all([
      createGallery(deps(), seed.context, seed.ownerId, seed.bookedProjectId, VALUES),
      createGallery(deps(), seed.context, seed.ownerId, seed.bookedProjectId, VALUES),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results).toContainEqual({ ok: false, code: "ALREADY_EXISTS" });
    const rows = await db.select().from(gallery).where(eq(gallery.projectId, seed.bookedProjectId));
    expect(rows).toHaveLength(1);
  });

  it("AC-GAL-003 refuses a draft project", async () => {
    const seed = await seedGalleryWorkspace(db);
    expect(
      await createGallery(deps(), seed.context, seed.ownerId, seed.draftProjectId, VALUES),
    ).toEqual({ ok: false, code: "NOT_ALLOWED_FOR_PROJECT" });
  });

  it("AC-GAL-025 gives another workspace not found on create and read", async () => {
    const seed = await seedGalleryWorkspace(db);
    const other = await seedGalleryWorkspace(db);
    await createGallery(deps(), seed.context, seed.ownerId, seed.bookedProjectId, VALUES);
    await expect(
      createGallery(deps(), other.context, other.ownerId, seed.bookedProjectId, VALUES),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      getGalleryCard(
        createDrizzleGalleryRepository(db),
        cipher,
        other.context,
        seed.bookedProjectId,
        NOW,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await expect(
      getGalleryPage(
        createDrizzleGalleryRepository(db),
        cipher,
        other.context,
        seed.bookedProjectId,
        NOW,
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("D-1 D-2 the checks refuse a stored EXPIRED, both expiries, or a published draft", async () => {
    const seed = await seedGalleryWorkspace(db);
    const base = {
      workspaceId: seed.context.workspaceId,
      projectId: seed.bookedProjectId,
      passwordCiphertext: "c",
      passwordIv: "i",
      passwordHash: "h",
    };
    await expect(db.insert(gallery).values({ ...base, status: "EXPIRED" })).rejects.toThrow();
    await expect(
      db.insert(gallery).values({ ...base, expiresAt: new Date(), expiryDays: 3 }),
    ).rejects.toThrow();
    await expect(
      db
        .insert(gallery)
        .values({ ...base, status: "PUBLISHED", expiryDays: 3, publishedAt: new Date() }),
    ).rejects.toThrow();
    await expect(db.insert(gallery).values({ ...base, publishedAt: new Date() })).rejects.toThrow();
    await expect(db.insert(gallery).values({ ...base, expiryDays: 0 })).rejects.toThrow();
  });

  it("BR-GAL-009 a folder is linked once per gallery but again after removal", async () => {
    const seed = await seedGalleryWorkspace(db);
    const created = await createGallery(
      deps(),
      seed.context,
      seed.ownerId,
      seed.bookedProjectId,
      VALUES,
    );
    if (!created.ok) throw new Error("create failed");
    const source = {
      workspaceId: seed.context.workspaceId,
      galleryId: created.galleryId,
      workspaceSourceId: seed.sourceConfigId,
      providerFolderId: "1AbCdEfGhIjKlMnOp",
    };
    const [first] = await db
      .insert(gallerySource)
      .values(source)
      .returning({ id: gallerySource.id });
    await expect(db.insert(gallerySource).values(source)).rejects.toThrow();
    await db
      .update(gallerySource)
      .set({ removedAt: new Date() })
      .where(eq(gallerySource.id, first.id));
    await expect(db.insert(gallerySource).values(source)).resolves.toBeDefined();
    await expect(
      db.insert(gallerySource).values({ ...source, providerFolderId: "bad id!" }),
    ).rejects.toThrow();
  });
});
