import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { createDrizzleSelectionRepository } from "@/adapters/db/selection-repository/drizzle-selection-repository";
import { getClientHome } from "@/features/gallery/application/use-cases/get-client-home/get-client-home";

import { openTestDb } from "../../helpers/test-db";
import { clientContextOf } from "./client-context";
import {
  addProjectItems,
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

async function project() {
  const created = await seedProjectWithGallery(db, {
    workspaceId: fixture.context.workspaceId,
    serviceId: fixture.serviceId,
    clientName: "Rina",
    title: "Wisuda Rina",
    status: "POST_PROCESSING",
  });
  return { ...created, workspaceId: fixture.context.workspaceId };
}

function home(target: Awaited<ReturnType<typeof project>>, finalDeliveryPublished = false) {
  return getClientHome(
    {
      selections: createDrizzleSelectionRepository(db),
      browse: createDrizzleGalleryBrowseReader(db, { client: true }),
    },
    clientContextOf({ ...target, finalDeliveryPublished }),
  );
}

describe("Beranda (A-24, A-31)", () => {
  it("AC-SEL-001 lands on Beranda with both groups open, usage 0 and visible proofs counted", async () => {
    const target = await project();
    await addProjectItems(db, target, [
      { name: "Foto edit", value: 3, pickMode: "COUNT", allowsPickNotes: true },
      { name: "Foto cetak", value: 2, unit: "lembar", pickMode: "QUANTITY" },
    ]);
    await createDrizzleGallerySourceRepository(db).withLockedGallery(
      fixture.context,
      target.galleryId,
      (_gallery, writer) => writer.createSelectionGroups(),
    );
    await seedPhotos(db, target, [
      { fileName: "IMG_001.jpg" },
      { fileName: "IMG_002.jpg" },
      { fileName: "IMG_010.jpg", missing: true },
      { fileName: "E_001.jpg", kind: "EDITED" },
    ]);
    const removed = await seedPhotos(db, target, [{ fileName: "IMG_099.jpg" }]);
    await db
      .update(gallerySource)
      .set({ removedAt: new Date() })
      .where(eq(gallerySource.id, removed.sourceId));

    const view = await home(target);
    expect(view).toMatchObject({
      landing: "HOME",
      greeting: { kind: "START" },
      proofCount: 2,
      editedCount: 0,
    });
    expect(
      view.groups.map((group) => [group.name, group.usage, group.limit, group.unit, group.action]),
    ).toEqual([
      ["Foto edit", 0, 3, "foto", "START"],
      ["Foto cetak", 0, 2, "lembar", "START"],
    ]);
    expect(view.groups.map((group) => group.isPrimary)).toEqual([true, false]);
  });

  it("AC-SEL-012 AC-SEL-020 opens Semua foto without groups, Beranda once delivered", async () => {
    const target = await project();
    await addProjectItems(db, target, [{ name: "Album", value: 1, pickMode: null }]);
    expect((await home(target)).landing).toBe("ALL_PHOTOS");
    const delivered = await home(target, true);
    expect(delivered).toMatchObject({ landing: "HOME", greeting: { kind: "DELIVERED" } });
    expect(delivered.groups).toEqual([]);
  });
});
