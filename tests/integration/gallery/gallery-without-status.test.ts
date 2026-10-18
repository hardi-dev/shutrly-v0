import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientAccessRepository } from "@/adapters/db/gallery-repository/drizzle-client-access-repository";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { project } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { findAvailableGallery } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access";

import { openTestDb } from "../helpers/test-db";
import { type GallerySeed, seedGalleryWorkspace } from "./helpers/gallery-seed";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const CLIENT_IP = "203.0.113.7";

/** Inserts a gallery row the way F-27 creates one: no status, no expiry (AC-GFL-005, D-12). */
async function insertGalleryWithoutStatus(seed: GallerySeed): Promise<string> {
  const [row] = await db
    .insert(gallery)
    .values({
      workspaceId: seed.context.workspaceId,
      projectId: seed.bookedProjectId,
      passwordCiphertext: "ciphertext-for-test",
      passwordIv: "iv-for-test",
      passwordHash: "hash-for-test",
      createdBy: seed.ownerId,
      updatedBy: seed.ownerId,
    })
    .returning({ id: gallery.id, status: gallery.status });
  expect(row.status).toBeNull();
  return row.id;
}

async function tokenOf(projectId: string): Promise<string> {
  const row = (
    await db
      .select({ token: project.clientAccessToken })
      .from(project)
      .where(eq(project.id, projectId))
  ).at(0);
  if (!row) throw new Error("project not found");
  return row.token;
}

function gate(now: Date) {
  return {
    repository: createDrizzleClientAccessRepository(db),
    rateLimiter: { hit: () => Promise.resolve(true), peek: () => Promise.resolve(true) },
    now,
  };
}

describe("a gallery without a stored status", () => {
  it("AC-GFL-008 the client gate opens it with no publish step", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await insertGalleryWithoutStatus(seed);
    const token = await tokenOf(seed.bookedProjectId);
    const record = await findAvailableGallery(gate(new Date()), token, CLIENT_IP);
    expect(record?.galleryId).toBe(galleryId);
  });

  it("D-12 the Owner's gallery card reads it without a stored status", async () => {
    const seed = await seedGalleryWorkspace(db);
    const galleryId = await insertGalleryWithoutStatus(seed);
    const card = await createDrizzleGalleryRepository(db).findCard(
      seed.context,
      seed.bookedProjectId,
    );
    expect(card?.summary?.gallery.id).toBe(galleryId);
  });

  it("AC-GFL-016 the client gate refuses it once its project is cancelled", async () => {
    const seed = await seedGalleryWorkspace(db);
    await insertGalleryWithoutStatus(seed);
    const token = await tokenOf(seed.bookedProjectId);
    await db
      .update(project)
      .set({ status: "CANCELLED", cancelledAt: new Date(), cancelledBy: seed.ownerId })
      .where(eq(project.id, seed.bookedProjectId));
    expect(await findAvailableGallery(gate(new Date()), token, CLIENT_IP)).toBeNull();
  });
});
