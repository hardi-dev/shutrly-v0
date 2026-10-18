import { TEST_APP_ENV } from "@tests/support/env/test-app-env";
import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { and, eq } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createWebCryptoRandomInt } from "@/adapters/crypto/random-int/web-crypto-random-int";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleProjectRepository } from "@/adapters/db/project-repository/drizzle-project-repository";
import { serviceItemDefinition } from "@/adapters/db/schema/booking/catalog";
import { project } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { selectionGroup } from "@/adapters/db/schema/gallery/selection";
import {
  confirmBookingWithGallery,
  createProjectWithGallery,
} from "@/composition/booking/booking-gallery-scope/booking-gallery-flows";
import {
  type GalleryPlanDeps,
  planForConfirm,
  planForCreate,
  runBookingGalleryTransaction,
} from "@/composition/booking/booking-gallery-scope/booking-gallery-scope";
import { runMarkDeliveredTransaction } from "@/composition/gallery/mark-delivered-scope/mark-delivered-scope";
import { cancelProject } from "@/features/booking/application/use-cases/cancel-project/cancel-project";
import { galleryState } from "@/features/gallery/domain/gallery-state/gallery-state";

import { type PhotoSeed, seedPhotos } from "../gallery/client-access/fixture";
import { type GallerySeed, seedGalleryWorkspace } from "../gallery/helpers/gallery-seed";
import { openTestDb } from "../helpers/test-db";

let db: Db;
let close: () => Promise<void>;

beforeAll(async () => {
  ({ db, close } = await openTestDb());
});
afterAll(() => close());

const LOCALE = "id-ID";
const deps: GalleryPlanDeps = {
  cipher: createWebCryptoGalleryPasswordCipher(TEST_APP_ENV.GALLERY_PASSWORD_KEY),
  hasher: fakeHasher,
  randomInt: createWebCryptoRandomInt(),
  newId: () => crypto.randomUUID(),
};

/** A selection item definition in the workspace, so a booking creates a selection group (BR-SEL-001). */
async function selectionDefinition(workspaceId: string): Promise<string> {
  const [row] = await db
    .insert(serviceItemDefinition)
    .values({
      workspaceId,
      name: `Foto edit ${crypto.randomUUID().slice(0, 8)}`,
      valueType: "NUMBER",
      unit: "foto",
      selectionRequired: true,
      pickMode: "COUNT",
    })
    .returning({ id: serviceItemDefinition.id });
  return row.id;
}

/** The raw create form for Rina's client and the seeded service (AC-GFL-001). */
async function createForm(seed: GallerySeed, title: string, mode: "DRAFT" | "BOOKED") {
  const [row] = await db
    .select({ clientId: project.clientId, serviceId: project.serviceId })
    .from(project)
    .where(eq(project.id, seed.bookedProjectId));
  return {
    mode,
    clientId: row.clientId,
    serviceId: row.serviceId,
    title,
    agreedPrice: "700.000",
    notes: "",
    items: [
      {
        definitionId: await selectionDefinition(seed.context.workspaceId),
        value: { type: "NUMBER", value: "25" },
      },
    ],
    sessions: [
      {
        name: "Wisuda",
        date: "2026-11-10",
        startTime: "07:30",
        endTime: "10:00",
        location: "Balairung UI, Depok",
      },
    ],
    fieldValues: {},
  };
}

/** Saves a BOOKED project the way the booking composition does, in one transaction (AC-GFL-001). */
async function saveBooked(seed: GallerySeed, title: string, failGallery = false) {
  const values = await createForm(seed, title, "BOOKED");
  const plan = await planForCreate(db, deps, seed.context, values, LOCALE);
  return runBookingGalleryTransaction(db, (scope) =>
    createProjectWithGallery(
      failGallery
        ? { ...scope, galleries: { ...scope.galleries, withProjectForGallery: failure } }
        : scope,
      seed.context,
      seed.ownerId,
      values,
      LOCALE,
      plan,
    ),
  );
}

/** Stands in for a gallery write that fails inside the booking transaction (AC-GFL-003). */
function failure(): Promise<never> {
  return Promise.reject(new Error("forced gallery failure"));
}

async function projectRows(seed: GallerySeed, title: string) {
  return db
    .select({ id: project.id, status: project.status })
    .from(project)
    .where(and(eq(project.workspaceId, seed.context.workspaceId), eq(project.title, title)));
}

async function galleriesOf(projectId: string) {
  return db.select().from(gallery).where(eq(gallery.projectId, projectId));
}

async function groupsOf(galleryId: string) {
  return db.select().from(selectionGroup).where(eq(selectionGroup.galleryId, galleryId));
}

describe("booking creates the project's gallery", () => {
  it("AC-GFL-001 a BOOKED project is saved with one gallery, no expiry and one OPEN selection group", async () => {
    const seed = await seedGalleryWorkspace(db);
    const result = await saveBooked(seed, "Wisuda Mira");
    if (!result.ok) throw new Error("booking refused");
    const [created] = await galleriesOf(result.projectId);
    expect(created.expiresAt).toBeNull();
    expect(created.passwordHash).not.toBe("");
    const groups = await groupsOf(created.id);
    expect(groups).toHaveLength(1);
    expect(groups[0]).toMatchObject({ status: "OPEN", baseLimit: 25 });
  });

  it("AC-GFL-002 confirming a DRAFT saves the gallery and its selection groups together", async () => {
    const seed = await seedGalleryWorkspace(db);
    const draftForm = await createForm(seed, "Wisuda Sari Draft", "DRAFT");
    const draft = await runBookingGalleryTransaction(db, (scope) =>
      createProjectWithGallery(scope, seed.context, seed.ownerId, draftForm, LOCALE, null),
    );
    if (!draft.ok) throw new Error("draft refused");
    expect(await galleriesOf(draft.projectId)).toHaveLength(0);
    const plan = await planForConfirm(db, deps, seed.context, draft.projectId);
    const result = await runBookingGalleryTransaction(db, (scope) =>
      confirmBookingWithGallery(scope, seed.context, seed.ownerId, draft.projectId, plan),
    );
    expect(result).toBeUndefined();
    const [row] = await db.select().from(project).where(eq(project.id, draft.projectId));
    expect(row.status).toBe("BOOKED");
    const galleries = await galleriesOf(draft.projectId);
    expect(galleries).toHaveLength(1);
    expect(await groupsOf(galleries[0].id)).toHaveLength(1);
  });

  it("AC-GFL-003 a gallery that cannot be written leaves no project, session or gallery", async () => {
    const seed = await seedGalleryWorkspace(db);
    await expect(saveBooked(seed, "Wisuda Gagal", true)).rejects.toThrow("forced gallery failure");
    expect(await projectRows(seed, "Wisuda Gagal")).toHaveLength(0);
  });

  it("AC-GFL-016 cancelling the booked project closes its gallery", async () => {
    const seed = await seedGalleryWorkspace(db);
    const booked = await saveBooked(seed, "Wisuda Batal");
    if (!booked.ok) throw new Error("booking refused");
    await db.transaction((tx) =>
      cancelProject(
        createDrizzleProjectRepository(tx),
        seed.context,
        seed.ownerId,
        booked.projectId,
        { reason: "" },
      ),
    );
    const facts = await createDrizzleGalleryRepository(db).findProjectFacts(
      seed.context,
      booked.projectId,
    );
    if (!facts) throw new Error("project missing");
    expect(galleryState(facts.status, null, new Date())).toBe("CLOSED");
  });
});

/** A BOOKED project moved to POST_PROCESSING, with its gallery and the given synced photos (AC-GFL-017). */
async function postProcessingWith(seed: GallerySeed, title: string, photos: readonly PhotoSeed[]) {
  const booked = await saveBooked(seed, title);
  if (!booked.ok) throw new Error("booking refused");
  await db
    .update(project)
    .set({ status: "POST_PROCESSING" })
    .where(eq(project.id, booked.projectId));
  const [created] = await galleriesOf(booked.projectId);
  await seedPhotos(db, { workspaceId: seed.context.workspaceId, galleryId: created.id }, photos);
  return { projectId: booked.projectId, galleryId: created.id };
}

describe("Tandai terkirim moves the project through the gallery check", () => {
  it("AC-GFL-017 with a synced EDITED file the project becomes DELIVERED, with the time recorded", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { projectId, galleryId } = await postProcessingWith(seed, "Wisuda Terkirim", [
      { fileName: "E_001.jpg", kind: "EDITED" },
    ]);
    const result = await runMarkDeliveredTransaction(db, {
      context: seed.context,
      actorId: seed.ownerId,
      projectId,
    });
    expect(result).toBeUndefined();
    const [row] = await db.select().from(project).where(eq(project.id, projectId));
    expect(row.status).toBe("DELIVERED");
    const [g] = await db.select().from(gallery).where(eq(gallery.id, galleryId));
    expect(g.finalDeliveryPublishedAt).not.toBeNull();
  });

  it("AC-GFL-017 without a synced finished file Tandai terkirim is refused and nothing moves", async () => {
    const seed = await seedGalleryWorkspace(db);
    const { projectId } = await postProcessingWith(seed, "Wisuda Belum Jadi", [
      { fileName: "IMG_001.jpg" },
    ]);
    const result = await runMarkDeliveredTransaction(db, {
      context: seed.context,
      actorId: seed.ownerId,
      projectId,
    });
    expect(result).toMatchObject({ ok: false, code: "REFUSED" });
    const [row] = await db.select().from(project).where(eq(project.id, projectId));
    expect(row.status).toBe("POST_PROCESSING");
  });
});
