import { eq, inArray } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { gallery, galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { deleteGallerySource } from "@/features/gallery/application/use-cases/delete-gallery-source/delete-gallery-source";
import { renameGallerySource } from "@/features/gallery/application/use-cases/rename-gallery-source/rename-gallery-source";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../../helpers/test-db";
import { type ClientAccessFixture, seedClientAccess, seedPhotos, seedPicks } from "./fixture";
import { seedWorld } from "./selection-world";

let db: Db;
let close: () => Promise<void>;
let fixture: ClientAccessFixture;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
  fixture = await seedClientAccess(db);
});
afterAll(() => close());

const deps = () => ({ sources: createDrizzleGallerySourceRepository(db), now: new Date() });

/** A published *Wisuda Rina* with its first folder (picks possible) and a second folder *Extra*. */
async function twoFolders() {
  const world = await seedWorld(db, fixture);
  const target = { workspaceId: fixture.context.workspaceId, galleryId: world.client.galleryId };
  const extra = await seedPhotos(db, target, [
    { fileName: "X_001.jpg" },
    { fileName: "X_002.jpg" },
  ]);
  const [first] = await db
    .select({ id: galleryPhoto.gallerySourceId })
    .from(galleryPhoto)
    .where(eq(galleryPhoto.id, world.photo["IMG_001.jpg"]));
  return { world, target, extra, firstSourceId: first.id };
}

const photosOf = (sourceId: string) =>
  db.select().from(galleryPhoto).where(eq(galleryPhoto.gallerySourceId, sourceId));

describe("deleting and renaming a gallery folder against Postgres", () => {
  it("AC-GAL-013 deletes a folder with its photos and bumps the content version", async () => {
    const { target, extra } = await twoFolders();
    const [before] = await db.select().from(gallery).where(eq(gallery.id, target.galleryId));
    expect(await deleteGallerySource(deps(), fixture.context, extra.sourceId)).toEqual({
      ok: true,
    });
    expect(
      await db.select().from(gallerySource).where(eq(gallerySource.id, extra.sourceId)),
    ).toHaveLength(0);
    expect(await photosOf(extra.sourceId)).toHaveLength(0);
    const [after] = await db.select().from(gallery).where(eq(gallery.id, target.galleryId));
    expect(after.contentVersion).toBe(before.contentVersion + 1);
  });

  it("AC-GAL-013 BR-GAL-009 refuses a folder with a client pick and keeps every row", async () => {
    const { world, firstSourceId } = await twoFolders();
    await seedPicks(db, { workspaceId: fixture.context.workspaceId, groupId: world.edit }, [
      world.photo["IMG_001.jpg"],
    ]);
    const photos = (await photosOf(firstSourceId)).length;
    expect(await deleteGallerySource(deps(), fixture.context, firstSourceId)).toEqual({
      ok: false,
      code: "HAS_PICKS",
    });
    expect(await photosOf(firstSourceId)).toHaveLength(photos);
  });

  it("AC-GAL-013 leaves another gallery's link to the same folder alone", async () => {
    const { target, extra } = await twoFolders();
    const [extraRow] = await db
      .select()
      .from(gallerySource)
      .where(eq(gallerySource.id, extra.sourceId));
    const other = await seedWorld(db, fixture);
    const [twin] = await db
      .insert(gallerySource)
      .values({ ...extraRow, id: undefined, galleryId: other.client.galleryId })
      .returning({ id: gallerySource.id });
    expect(target.galleryId).not.toBe(other.client.galleryId);
    expect(await deleteGallerySource(deps(), fixture.context, extra.sourceId)).toEqual({
      ok: true,
    });
    expect(
      await db
        .select()
        .from(gallerySource)
        .where(inArray(gallerySource.id, [twin.id])),
    ).toHaveLength(1);
  });

  it("AC-GAL-037 renames a folder and clears it back to the folder name", async () => {
    const { extra } = await twoFolders();
    const label = async () =>
      (await db.select().from(gallerySource).where(eq(gallerySource.id, extra.sourceId)))[0].label;
    expect(
      await renameGallerySource(deps(), fixture.context, extra.sourceId, { label: " Softball " }),
    ).toEqual({ ok: true });
    expect(await label()).toBe("Softball");
    expect(
      await renameGallerySource(deps(), fixture.context, extra.sourceId, { label: "" }),
    ).toEqual({ ok: true });
    expect(await label()).toBeNull();
  });

  it("C-101 another workspace can't delete or rename the folder", async () => {
    const { extra } = await twoFolders();
    const stranger = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await expect(deleteGallerySource(deps(), stranger, extra.sourceId)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    await expect(
      renameGallerySource(deps(), stranger, extra.sourceId, { label: "x" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    expect(await photosOf(extra.sourceId)).toHaveLength(2);
  });
});
