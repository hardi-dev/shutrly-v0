// Galleries for `pnpm db:seed`: create with a password, link a public Drive folder, sync it with the
// real Drive provider, map `edited` / `print` subfolders to the package items (F-21) and publish.
import { randomBytes } from "node:crypto";

import { and, asc, eq, isNull } from "drizzle-orm";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createBetterAuthPasswordHasher } from "@/adapters/crypto/password-hasher/better-auth-password-hasher";
import { createWebCryptoRandomInt } from "@/adapters/crypto/random-int/web-crypto-random-int";
import { createDrizzleGalleryBrowseReader } from "@/adapters/db/gallery-repository/drizzle-gallery-browse-reader";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { createDrizzleGallerySourceRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-source-repository";
import { createNeonRateLimiter } from "@/adapters/db/rate-limiter/neon-rate-limiter";
import { project } from "@/adapters/db/schema/booking/project";
import { gallery, galleryPhoto, gallerySource } from "@/adapters/db/schema/gallery/gallery";
import { workspaceSourceConfig } from "@/adapters/db/schema/gallery/workspace-source-config";
import { createDrizzleWorkspaceSourceRepository } from "@/adapters/db/workspace-source-repository/drizzle-workspace-source-repository";
import { createGoogleDriveProvider } from "@/adapters/source/google-drive-provider/google-drive-provider";
import { runFinalDeliveryTransaction } from "@/composition/gallery/final-delivery-scope/final-delivery-scope";
import type { GalleryScope } from "@/composition/gallery/gallery-scope/gallery-scope.types";
import { createGallery } from "@/features/gallery/application/use-cases/create-gallery/create-gallery";
import {
  getFolderMapping,
  setFolderMapping,
} from "@/features/gallery/application/use-cases/folder-mapping/folder-mapping";
import { linkGallerySource } from "@/features/gallery/application/use-cases/link-gallery-source/link-gallery-source";
import { publishGallery } from "@/features/gallery/application/use-cases/publish-gallery/publish-gallery";
import type { ClientContext } from "@/features/gallery/application/use-cases/resolve-client-access/resolve-client-access.types";
import { syncGallerySourceStep } from "@/features/gallery/application/use-cases/sync-gallery-source-step/sync-gallery-source-step";

import { check, present, type SeedEnv, type Studio } from "./seed-support";

const MAX_SYNC_STEPS = 200;

export interface GallerySeed {
  readonly projectId: string;
  readonly folder: string;
  readonly label: string;
}

export interface SeededGallery {
  readonly galleryId: string;
  readonly sourceId: string;
}

function galleryScope(studio: Studio, env: SeedEnv): GalleryScope {
  const { db } = studio;
  return {
    galleries: createDrizzleGalleryRepository(db),
    browse: createDrizzleGalleryBrowseReader(db),
    sources: createDrizzleGallerySourceRepository(db),
    workspaceSources: createDrizzleWorkspaceSourceRepository(db),
    provider: createGoogleDriveProvider(env.driveApiKey),
    directImages: true,
    rateLimiter: createNeonRateLimiter(db),
    cipher: createWebCryptoGalleryPasswordCipher(env.galleryPasswordKey),
    hasher: createBetterAuthPasswordHasher(),
    randomInt: createWebCryptoRandomInt(),
    newId: () => crypto.randomUUID(),
    now: new Date(),
  };
}

async function syncSource(studio: Studio, scope: GalleryScope, sourceId: string): Promise<void> {
  for (let step = 1; step <= MAX_SYNC_STEPS; step += 1) {
    const outcome = await syncGallerySourceStep(
      { ...scope, now: new Date() },
      studio.context,
      sourceId,
    );
    if (!outcome.ok) throw new Error(`sync refused: ${JSON.stringify(outcome)}`);
    if (outcome.status === "SUCCEEDED") return;
    if (outcome.status === "FAILED") throw new Error(`sync failed: ${outcome.errorCode}`);
    console.log(
      `  sync step ${String(step)}: ${String(outcome.foldersDone)}/${String(outcome.foldersTotal)} folders`,
    );
  }
  throw new Error("sync did not finish");
}

async function workspaceSourceId(studio: Studio): Promise<string> {
  const row = (
    await studio.db
      .select({ id: workspaceSourceConfig.id })
      .from(workspaceSourceConfig)
      .where(eq(workspaceSourceConfig.workspaceId, studio.context.workspaceId))
  ).at(0);
  if (!row) throw new Error("default photo source is missing");
  return row.id;
}

// F-21: no folder name is recognised by itself, so the seed maps the demo names to the package items.
const SEED_FOLDER_ITEMS: Readonly<Record<string, string>> = {
  edited: "Foto edit",
  print: "Foto cetak",
};

/** Maps the synced `edited` / `print` subfolders to *Foto edit* / *Foto cetak* (F-21). @param studio - the seeded studio @param scope - gallery deps @param sourceId - the linked folder */
async function mapFinishedFolders(
  studio: Studio,
  scope: GalleryScope,
  sourceId: string,
): Promise<void> {
  const view = await getFolderMapping(scope, studio.context, sourceId);
  const mappings = view.folders.flatMap((path) => {
    const itemName = SEED_FOLDER_ITEMS[path.toLowerCase()];
    const item = view.items.find((candidate) => candidate.name === itemName);
    return item ? [{ path, projectItemId: item.id }] : [];
  });
  if (mappings.length === 0) return;
  check(
    "folder mapping",
    await setFolderMapping({ ...scope, now: new Date() }, studio.context, sourceId, { mappings }),
  );
  console.log(`  mapped: ${mappings.map((entry) => entry.path).join(", ")}`);
}

/** Creates, links, syncs, maps and publishes one gallery; publishing opens its selection groups. */
export async function seedGallery(
  studio: Studio,
  env: SeedEnv,
  seed: GallerySeed,
): Promise<SeededGallery> {
  const scope = galleryScope(studio, env);
  const { context, ownerId } = studio;
  const created = check(
    "gallery",
    await createGallery(scope, context, ownerId, seed.projectId, {
      password: env.galleryPassword,
      expiry: { type: "NONE" },
    }),
  );
  const linked = check(
    "link folder",
    await linkGallerySource(scope, context, ownerId, created.galleryId, {
      workspaceSourceId: await workspaceSourceId(studio),
      link: seed.folder,
      label: seed.label,
    }),
  );
  await syncSource(studio, scope, linked.sourceId);
  await mapFinishedFolders(studio, scope, linked.sourceId);
  check(
    "publish",
    await publishGallery({ ...scope, now: new Date() }, context, ownerId, created.galleryId),
  );
  return { galleryId: created.galleryId, sourceId: linked.sourceId };
}

/** Publishes final delivery (the project moves to DELIVERED) when the source holds mapped files. @returns whether it was published */
export async function publishDeliveryIfFinished(
  studio: Studio,
  projectId: string,
  sourceId: string,
): Promise<boolean> {
  const counts = present(
    "source counts",
    (
      await studio.db
        .select({
          edited: gallerySource.editedCount,
          print: gallerySource.printCount,
          proofs: gallerySource.proofCount,
        })
        .from(gallerySource)
        .where(eq(gallerySource.id, sourceId))
    ).at(0),
  );
  console.log(
    `  synced: ${String(counts.proofs)} proofs, ${String(counts.edited)} edited, ${String(counts.print)} print`,
  );
  if (counts.edited + counts.print === 0) {
    console.log("  final delivery skipped: the folder has no `edited` or `print` subfolder");
    return false;
  }
  const refused = await runFinalDeliveryTransaction(studio.db, {
    context: studio.context,
    actorId: studio.ownerId,
    projectId,
  });
  if (refused) throw new Error(`final delivery refused: ${refused.reasons.join(", ")}`);
  return true;
}

/** The project's client link token (`/g/<token>`). */
export async function clientToken(studio: Studio, projectId: string): Promise<string> {
  const row = (
    await studio.db
      .select({ token: project.clientAccessToken })
      .from(project)
      .where(eq(project.id, projectId))
  ).at(0);
  if (!row?.token) throw new Error("client access token missing");
  return row.token;
}

/** A signed-in client of the gallery, as the password gate builds it, with a fresh session id. */
export async function clientOf(
  studio: Studio,
  projectId: string,
  seeded: SeededGallery,
): Promise<ClientContext> {
  const row = present(
    "gallery",
    (
      await studio.db
        .select({ contentVersion: gallery.contentVersion })
        .from(gallery)
        .where(eq(gallery.id, seeded.galleryId))
    ).at(0),
  );
  return {
    workspaceId: studio.context.workspaceId,
    projectId,
    galleryId: seeded.galleryId,
    sessionId: randomBytes(16).toString("hex"),
    token: await clientToken(studio, projectId),
    contentVersion: row.contentVersion,
    finalDeliveryPublished: false,
  };
}

/** The first `count` proofs of a gallery in name order, for picks. */
export async function proofIds(studio: Studio, galleryId: string, count: number) {
  const rows = await studio.db
    .select({ id: galleryPhoto.id })
    .from(galleryPhoto)
    .where(
      and(
        eq(galleryPhoto.galleryId, galleryId),
        eq(galleryPhoto.kind, "PROOF"),
        isNull(galleryPhoto.missingAt),
      ),
    )
    .orderBy(asc(galleryPhoto.nameSortKey))
    .limit(count);
  if (rows.length < count)
    throw new Error(`gallery has ${String(rows.length)} proofs, needs ${String(count)}`);
  return rows.map((row) => row.id);
}
