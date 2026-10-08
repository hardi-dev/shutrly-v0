import { eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleClientAccessRepository } from "@/adapters/db/gallery-repository/drizzle-client-access-repository";
import { createDrizzleDeliveryReader } from "@/adapters/db/gallery-repository/drizzle-delivery-reader";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { project } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { runFinalDeliveryTransaction } from "@/composition/gallery/final-delivery-scope/final-delivery-scope";
import { completeProject } from "@/features/booking/application/use-cases/complete-project/complete-project";
import { getDeliveryCard } from "@/features/gallery/application/use-cases/get-delivery-card/get-delivery-card";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import { openTestDb } from "../../helpers/test-db";
import {
  type ClientAccessFixture,
  type PhotoSeed,
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

const FINISHED: readonly PhotoSeed[] = [
  { fileName: "IMG_001.jpg" },
  { fileName: "E_001.jpg", kind: "EDITED" },
  { fileName: "E_002.jpg", kind: "EDITED" },
  { fileName: "P_001.jpg", kind: "PRINT" },
];

async function seedRina(status = "POST_PROCESSING", photos: readonly PhotoSeed[] = FINISHED) {
  const workspaceId = fixture.context.workspaceId;
  const rina = await seedProjectWithGallery(db, {
    workspaceId,
    serviceId: fixture.serviceId,
    clientName: "Rina",
    title: "Wisuda Rina",
    status,
  });
  await seedPhotos(db, { workspaceId, galleryId: rina.galleryId }, photos);
  return rina;
}

const publish = (projectId: string) =>
  runFinalDeliveryTransaction(db, {
    context: fixture.context,
    actorId: fixture.ownerId,
    projectId,
  });

async function stateOf(projectId: string, galleryId: string) {
  const [p] = await db
    .select({
      status: project.status,
      completedAt: project.completedAt,
      completedBy: project.completedBy,
    })
    .from(project)
    .where(eq(project.id, projectId));
  const [g] = await db
    .select({
      publishedAt: gallery.finalDeliveryPublishedAt,
      publishedBy: gallery.finalDeliveryPublishedBy,
      contentVersion: gallery.contentVersion,
    })
    .from(gallery)
    .where(eq(gallery.id, galleryId));
  return { ...p, ...g };
}

const card = (projectId: string) =>
  getDeliveryCard(
    { reader: createDrizzleDeliveryReader(db), now: new Date() },
    fixture.context,
    projectId,
  );

describe("final delivery (D-17, sequence 3)", () => {
  it("AC-DEL-001 records final delivery and moves the project to DELIVERED in one transaction", async () => {
    const rina = await seedRina();
    const before = await stateOf(rina.projectId, rina.galleryId);
    expect((await card(rina.projectId)).state).toBe("READY");
    expect(await publish(rina.projectId)).toBeUndefined();
    const after = await stateOf(rina.projectId, rina.galleryId);
    expect(after.status).toBe("DELIVERED");
    expect(after.publishedBy).toBe(fixture.ownerId);
    expect(after.publishedAt).not.toBeNull();
    expect(after.contentVersion).toBe(before.contentVersion + 1);
    const access = await createDrizzleClientAccessRepository(db).findByTokenUnscoped(rina.token);
    expect(access?.finalDeliveryPublishedAt).not.toBeNull();
    expect(await card(rina.projectId)).toMatchObject({
      state: "PUBLISHED",
      editedCount: 2,
      printCount: 1,
      // F-21: files seeded without an item count under their kind
      items: [
        { id: "EDITED", name: "Edited", count: 2 },
        { id: "PRINT", name: "Print", count: 1 },
      ],
      canComplete: true,
    });
  });

  it("AC-DEL-002 no finished file is refused and nothing changes", async () => {
    const rina = await seedRina("POST_PROCESSING", [
      { fileName: "IMG_001.jpg" },
      { fileName: "E_009.jpg", kind: "EDITED", missing: true },
    ]);
    const before = await stateOf(rina.projectId, rina.galleryId);
    expect(await publish(rina.projectId)).toEqual({
      ok: false,
      code: "REFUSED",
      reasons: ["NO_FINISHED_FILE"],
    });
    expect(await stateOf(rina.projectId, rina.galleryId)).toEqual(before);
  });

  it("AC-DEL-002 a project already DELIVERED is refused", async () => {
    const rina = await seedRina("DELIVERED");
    const before = await stateOf(rina.projectId, rina.galleryId);
    expect(await publish(rina.projectId)).toEqual({
      ok: false,
      code: "REFUSED",
      reasons: ["PROJECT_STATUS"],
    });
    expect(await stateOf(rina.projectId, rina.galleryId)).toEqual(before);
  });

  it("AC-DEL-002 an expired gallery is refused and the project's move rolls back", async () => {
    const rina = await seedRina();
    await db
      .update(gallery)
      .set({ expiresAt: new Date(Date.now() - 60_000) })
      .where(eq(gallery.id, rina.galleryId));
    const before = await stateOf(rina.projectId, rina.galleryId);
    expect(await publish(rina.projectId)).toEqual({
      ok: false,
      code: "REFUSED",
      reasons: ["GALLERY_NOT_PUBLISHED"],
    });
    const after = await stateOf(rina.projectId, rina.galleryId);
    expect(after).toEqual(before);
    expect(after.status).toBe("POST_PROCESSING");
    expect((await card(rina.projectId)).state).toBe("GALLERY_INACTIVE");
  });

  it("AC-DEL-002 every reason is returned together", async () => {
    const rina = await seedRina("DELIVERED", [{ fileName: "IMG_001.jpg" }]);
    expect(await publish(rina.projectId)).toEqual({
      ok: false,
      code: "REFUSED",
      reasons: ["PROJECT_STATUS", "NO_FINISHED_FILE"],
    });
  });

  it("C-101 another workspace's project is not found and nothing changes", async () => {
    const rina = await seedRina();
    const before = await stateOf(rina.projectId, rina.galleryId);
    const stranger = { workspaceId: asWorkspaceId(crypto.randomUUID()) };
    await expect(
      runFinalDeliveryTransaction(db, {
        context: stranger,
        actorId: fixture.ownerId,
        projectId: rina.projectId,
      }),
    ).rejects.toThrow();
    expect(await stateOf(rina.projectId, rina.galleryId)).toEqual(before);
  });
});

describe("Tandai selesai (BR-PRJ-005)", () => {
  it("AC-DEL-007 completes a delivered project with actor and time; the client keeps access", async () => {
    const rina = await seedRina();
    await publish(rina.projectId);
    const now = new Date("2026-10-12T03:00:00Z");
    const projects = createDrizzleProjectRepository(db);
    expect(
      await completeProject(projects, fixture.context, fixture.ownerId, rina.projectId, now),
    ).toBeUndefined();
    const after = await stateOf(rina.projectId, rina.galleryId);
    expect([after.status, after.completedBy, after.completedAt?.toISOString()]).toEqual([
      "COMPLETED",
      fixture.ownerId,
      now.toISOString(),
    ]);
    const access = await createDrizzleClientAccessRepository(db).findByTokenUnscoped(rina.token);
    expect([access?.projectStatus, access?.galleryStatus]).toEqual(["COMPLETED", "PUBLISHED"]);
    expect((await card(rina.projectId)).state).toBe("COMPLETED");
  });

  it("AC-DEL-007 refuses a project that isn't DELIVERED", async () => {
    const rina = await seedRina();
    const projects = createDrizzleProjectRepository(db);
    expect(
      await completeProject(projects, fixture.context, fixture.ownerId, rina.projectId, new Date()),
    ).toEqual({
      ok: false,
      code: "PROJECT_STATUS",
    });
    expect((await stateOf(rina.projectId, rina.galleryId)).status).toBe("POST_PROCESSING");
  });
});
