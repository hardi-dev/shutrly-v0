import { uniqueEmail } from "@tests/support/auth/unique";
import { fakeHasher } from "@tests/support/gallery/fake-gallery-crypto";
import { eq } from "drizzle-orm";

import type { Db } from "@/adapters/db/client/client.types";
import { user } from "@/adapters/db/schema/auth/auth";
import {
  service,
  serviceCategory,
  serviceItemDefinition,
} from "@/adapters/db/schema/booking/catalog";
import { client } from "@/adapters/db/schema/booking/client";
import { project, projectItem } from "@/adapters/db/schema/booking/project";
import { gallery, galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { photoSelection } from "@/adapters/db/schema/gallery/selection";
import { workspaceSourceConfig } from "@/adapters/db/schema/gallery/workspace-source-config";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export const GALLERY_PASSWORD = "mawar-4821";

export interface ClientAccessFixture {
  readonly context: WorkspaceContext;
  readonly ownerId: string;
  readonly serviceId: string;
  /** Wisuda Rina, POST_PROCESSING, published gallery. */
  readonly t1: string;
  readonly projectId: string;
  readonly galleryId: string;
  /** Wisuda Sari, BOOKED, same workspace, its own published gallery. */
  readonly t2: string;
  /** A project in another workspace. */
  readonly t3: string;
}

/** A random 43-character base64url token, like the generator's (BR-PRJ-003). */
export function randomToken(): string {
  return Buffer.from(crypto.getRandomValues(new Uint8Array(32))).toString("base64url");
}

/** A private-range address of its own, so counters never collide between tests (ADR-009). */
export function randomIp(): string {
  const [a, b, c] = crypto.getRandomValues(new Uint8Array(3));
  return `10.${String(a)}.${String(b)}.${String(c)}`;
}

async function seedStudio(db: Db, brandName: string) {
  const ownerId = crypto.randomUUID();
  await db.insert(user).values({ id: ownerId, name: "Client Owner", email: uniqueEmail() });
  const [ws] = await db
    .insert(workspace)
    .values({
      ownerUserId: ownerId,
      name: `Client ${crypto.randomUUID()}`,
      brandName,
      invoicePrefix: "CLI",
    })
    .returning({ id: workspace.id });
  const [category] = await db
    .insert(serviceCategory)
    .values({ workspaceId: ws.id, name: "Wisuda" })
    .returning({ id: serviceCategory.id });
  const [basic] = await db
    .insert(service)
    .values({ workspaceId: ws.id, categoryId: category.id, name: "Wisuda", basePrice: "700000" })
    .returning({ id: service.id });
  return { ownerId, workspaceId: ws.id, serviceId: basic.id };
}

interface ProjectSeed {
  readonly workspaceId: string;
  readonly serviceId: string;
  readonly clientName: string;
  readonly title: string;
  readonly status: string;
}

/** Inserts a client, its project and a published gallery with the fixture password. */
export async function seedProjectWithGallery(db: Db, seed: ProjectSeed) {
  const token = randomToken();
  const [person] = await db
    .insert(client)
    .values({ workspaceId: seed.workspaceId, name: seed.clientName })
    .returning({ id: client.id });
  const [row] = await db
    .insert(project)
    .values({
      workspaceId: seed.workspaceId,
      clientId: person.id,
      serviceId: seed.serviceId,
      agreedPrice: "700000",
      title: seed.title,
      status: seed.status,
      clientAccessToken: token,
    })
    .returning({ id: project.id });
  const [created] = await db
    .insert(gallery)
    .values({
      workspaceId: seed.workspaceId,
      projectId: row.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      passwordCiphertext: "enc",
      passwordIv: "iv",
      passwordHash: await fakeHasher.hash(GALLERY_PASSWORD),
    })
    .returning({ id: gallery.id });
  return { token, projectId: row.id, galleryId: created.id };
}

/** Seeds the AC shared fixture's gate part: T1, T2 in one studio, T3 in another (ADR-009: own rows only). */
export async function seedClientAccess(db: Db): Promise<ClientAccessFixture> {
  const studio = await seedStudio(db, "Studio Senja");
  const base = { workspaceId: studio.workspaceId, serviceId: studio.serviceId };
  const rina = await seedProjectWithGallery(db, {
    ...base,
    clientName: "Rina Saputri",
    title: "Wisuda Rina",
    status: "POST_PROCESSING",
  });
  const sari = await seedProjectWithGallery(db, {
    ...base,
    clientName: "Sari",
    title: "Wisuda Sari",
    status: "BOOKED",
  });
  const other = await seedStudio(db, "Studio Lain");
  const t3 = await seedProjectWithGallery(db, {
    workspaceId: other.workspaceId,
    serviceId: other.serviceId,
    clientName: "Dewi",
    title: "Wisuda Dewi",
    status: "BOOKED",
  });
  return {
    context: { workspaceId: asWorkspaceId(studio.workspaceId) },
    ownerId: studio.ownerId,
    serviceId: studio.serviceId,
    t1: rina.token,
    projectId: rina.projectId,
    galleryId: rina.galleryId,
    t2: sari.token,
    t3: t3.token,
  };
}

export interface ItemSeed {
  readonly name: string;
  readonly value: number;
  readonly unit?: string;
  /** null for an item the client doesn't pick for. */
  readonly pickMode: "COUNT" | "QUANTITY" | null;
  readonly allowsPickNotes?: boolean;
}

/** Adds snapshotted project items, each with its own definition, in the given order (BR-PRJ-001). @returns the item ids by name */
export async function addProjectItems(
  db: Db,
  target: { readonly workspaceId: string; readonly projectId: string },
  items: readonly ItemSeed[],
): Promise<Record<string, string>> {
  const ids: Record<string, string> = {};
  for (const [index, item] of items.entries()) {
    const selection = item.pickMode !== null;
    const shape = {
      workspaceId: target.workspaceId,
      valueType: "NUMBER",
      unit: item.unit ?? "foto",
      selectionRequired: selection,
      pickMode: item.pickMode,
      allowsPickNotes: item.allowsPickNotes ?? false,
    };
    const [definition] = await db
      .insert(serviceItemDefinition)
      .values({ ...shape, name: `${item.name} ${crypto.randomUUID().slice(0, 8)}` })
      .returning({ id: serviceItemDefinition.id });
    const [row] = await db
      .insert(projectItem)
      .values({
        ...shape,
        projectId: target.projectId,
        definitionId: definition.id,
        name: item.name,
        value: { type: "NUMBER", value: String(item.value) },
        sortOrder: index,
      })
      .returning({ id: projectItem.id });
    ids[item.name] = row.id;
  }
  return ids;
}

export interface PhotoSeed {
  readonly fileName: string;
  readonly kind?: "PROOF" | "EDITED" | "PRINT";
  readonly folderPath?: string;
  readonly missing?: boolean;
}

/** Links one Drive source to the gallery and inserts its photos, as a finished sync would (F-09). @returns the source id and the photo ids by file name */
export async function seedPhotos(
  db: Db,
  target: { readonly workspaceId: string; readonly galleryId: string },
  photos: readonly PhotoSeed[],
) {
  const inserted = await db
    .insert(workspaceSourceConfig)
    .values({ workspaceId: target.workspaceId, provider: "GOOGLE_DRIVE", displayName: "Drive" })
    .onConflictDoNothing()
    .returning({ id: workspaceSourceConfig.id });
  const configId =
    inserted.at(0)?.id ??
    (
      await db
        .select({ id: workspaceSourceConfig.id })
        .from(workspaceSourceConfig)
        .where(eq(workspaceSourceConfig.workspaceId, target.workspaceId))
    )[0].id;
  const [source] = await db
    .insert(gallerySource)
    .values({
      workspaceId: target.workspaceId,
      galleryId: target.galleryId,
      workspaceSourceId: configId,
      providerFolderId: `folder${crypto.randomUUID().replaceAll("-", "")}`,
      folderName: "Rina-Wisuda",
      syncStatus: "SUCCEEDED",
    })
    .returning({ id: gallerySource.id });
  const ids: Record<string, string> = {};
  for (const photo of photos) {
    const [row] = await db
      .insert(galleryPhoto)
      .values({
        workspaceId: target.workspaceId,
        galleryId: target.galleryId,
        gallerySourceId: source.id,
        externalFileId: `file${crypto.randomUUID().replaceAll("-", "")}`,
        fileName: photo.fileName,
        mimeType: "image/jpeg",
        nameSortKey: photo.fileName.toLowerCase(),
        kind: photo.kind ?? "PROOF",
        folderPath: photo.folderPath ?? "",
        browsePath: photo.folderPath ?? "",
        missingAt: photo.missing ? new Date() : null,
      })
      .returning({ id: galleryPhoto.id });
    ids[photo.fileName] = row.id;
  }
  return { sourceId: source.id, photoIds: ids };
}

/** Inserts picks straight into a group (later slices add the use cases). */
export async function seedPicks(
  db: Db,
  target: { readonly workspaceId: string; readonly groupId: string },
  photoIds: readonly string[],
  quantity = 1,
) {
  for (const photoId of photoIds) {
    await db.insert(photoSelection).values({
      workspaceId: target.workspaceId,
      selectionGroupId: target.groupId,
      photoId,
      quantity,
    });
  }
}
