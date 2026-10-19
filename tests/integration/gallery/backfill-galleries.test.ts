import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createWebCryptoRandomInt } from "@/adapters/crypto/random-int/web-crypto-random-int";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import { projectItem } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";
import { cancelProject } from "@/features/booking/application/use-cases/cancel-project/cancel-project";

import { backfillGalleries } from "../../../scripts/dev/backfill-galleries";
import { openTestDb } from "../helpers/test-db";
import { type GallerySeed, seedGalleryWorkspace } from "./helpers/gallery-seed";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const deps = {
  cipher: createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY),
  hasher: fakeHasher,
  randomInt: createWebCryptoRandomInt(),
  newId: () => crypto.randomUUID(),
};

/** Gives the booked project one selection item, so the backfill has a group to create (BR-SEL-001). */
async function selectionItem(seed: GallerySeed): Promise<void> {
  const [definition] = await db
    .insert(serviceItemDefinition)
    .values({
      workspaceId: seed.context.workspaceId,
      name: `Foto edit ${crypto.randomUUID().slice(0, 8)}`,
      valueType: "NUMBER",
      unit: "foto",
      selectionRequired: true,
      pickMode: "COUNT",
    })
    .returning({ id: serviceItemDefinition.id });
  await db.insert(projectItem).values({
    workspaceId: seed.context.workspaceId,
    projectId: seed.bookedProjectId,
    definitionId: definition.id,
    name: "Foto edit",
    valueType: "NUMBER",
    value: { type: "NUMBER", value: 25 },
    selectionRequired: true,
    sortOrder: 0,
    pickMode: "COUNT",
  });
}

/** The galleries of one project, and the selection groups of the first one. */
async function galleriesOf(projectId: string) {
  const galleries = await db
    .select({ id: gallery.id })
    .from(gallery)
    .where(eq(gallery.projectId, projectId));
  const groups = galleries[0]
    ? await db
        .select({ id: selectionGroup.id })
        .from(selectionGroup)
        .where(eq(selectionGroup.galleryId, galleries[0].id))
    : [];
  return { count: galleries.length, groups: groups.length };
}

describe("backfillGalleries (AC-GFL-005)", () => {
  it("creates a booked project's missing gallery with its group, then creates nothing", async () => {
    const seed = await seedGalleryWorkspace(db);
    await selectionItem(seed);

    const first = await backfillGalleries(db, deps, seed.context.workspaceId);
    expect(first).toEqual({ created: 1, skipped: 0 });
    expect(await galleriesOf(seed.bookedProjectId)).toEqual({ count: 1, groups: 1 });

    const second = await backfillGalleries(db, deps, seed.context.workspaceId);
    expect(second).toEqual({ created: 0, skipped: 1 });
    expect(await galleriesOf(seed.bookedProjectId)).toEqual({ count: 1, groups: 1 });
  });

  it("leaves a draft without a gallery", async () => {
    const seed = await seedGalleryWorkspace(db);

    await backfillGalleries(db, deps, seed.context.workspaceId);
    expect(await galleriesOf(seed.draftProjectId)).toEqual({ count: 0, groups: 0 });
  });

  it("creates no gallery for a cancelled project", async () => {
    const seed = await seedGalleryWorkspace(db);
    const cancelled = await cancelProject(
      createDrizzleProjectRepository(db),
      seed.context,
      seed.ownerId,
      seed.bookedProjectId,
      { reason: "Acara diundur, tanggal belum pasti" },
    );
    expect(cancelled).toBeUndefined();

    const counts = await backfillGalleries(db, deps, seed.context.workspaceId);
    expect(counts).toEqual({ created: 0, skipped: 0 });
    expect(await galleriesOf(seed.bookedProjectId)).toEqual({ count: 0, groups: 0 });
  });
});
