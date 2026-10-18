// Backfill for F-27 (D-13): creates the gallery of every booked-or-later project that has none, through
// the same use case the booking uses (createGalleryForBooking). Idempotent: a second run creates nothing.
// It imports no request scope (no request-db, no next/headers), so it runs with its own `db`.
// Usage: pnpm db:backfill-galleries
//   target: DATABASE_URL and GALLERY_PASSWORD_KEY from the environment, else from BACKFILL_ENV_FILE (.dev.vars)
//   Prints counts only. Passwords and client links are never printed or written.
import { pathToFileURL } from "node:url";

import { config } from "dotenv";
import { and, eq, inArray } from "drizzle-orm";

import { createWebCryptoGalleryPasswordCipher } from "@/adapters/crypto/gallery-password-cipher/web-crypto-gallery-password-cipher";
import { createBetterAuthPasswordHasher } from "@/adapters/crypto/password-hasher/better-auth-password-hasher";
import { createWebCryptoRandomInt } from "@/adapters/crypto/random-int/web-crypto-random-int";
import { createDb } from "@/adapters/db/client/client";
import type { Db } from "@/adapters/db/client/client.types";
import { createDrizzleGalleryRepository } from "@/adapters/db/gallery-repository/drizzle-gallery-repository";
import { project } from "@/adapters/db/schema/booking/project";
import { gallery } from "@/adapters/db/schema/gallery/gallery";
import { workspace } from "@/adapters/db/schema/workspace/workspace";
import {
  createGalleryForBooking,
  prepareGalleryPassword,
} from "@/features/gallery/application/use-cases/create-gallery-for-booking/create-gallery-for-booking";
import { generateGalleryPassword } from "@/features/gallery/domain/gallery-password/gallery-password";
import { GALLERY_PROJECT_ALLOWED } from "@/features/gallery/domain/gallery-state/gallery-state";
import { asWorkspaceId } from "@/shared/workspace-context/workspace-context";

import type { BackfillCounts, BackfillDeps } from "./backfill-galleries.types";

interface BookedProjectRow {
  readonly projectId: string;
  readonly workspaceId: string;
  readonly actorId: string;
  readonly galleryId: string | null;
}

/** The booked-or-later projects (optionally of one workspace) with their owner and gallery, if any. */
async function listBookedProjects(db: Db, workspaceId?: string): Promise<BookedProjectRow[]> {
  const rows = await db
    .select({
      projectId: project.id,
      workspaceId: project.workspaceId,
      actorId: workspace.ownerUserId,
      galleryId: gallery.id,
    })
    .from(project)
    .innerJoin(workspace, eq(workspace.id, project.workspaceId))
    .leftJoin(gallery, eq(gallery.projectId, project.id))
    .where(
      and(
        inArray(project.status, GALLERY_PROJECT_ALLOWED),
        workspaceId ? eq(project.workspaceId, workspaceId) : undefined,
      ),
    );
  return rows;
}

/**
 * Creates one missing gallery; the password is generated from the client's name (BR-GAL-002) and
 * encrypted and hashed before the write (ADR-017). Returns true when a gallery was created.
 * @param db - the database
 * @param deps - password ports
 * @param row - the booked project without a gallery
 * @returns whether this run created the gallery
 */
async function backfillOne(db: Db, deps: BackfillDeps, row: BookedProjectRow): Promise<boolean> {
  const context = { workspaceId: asWorkspaceId(row.workspaceId) };
  const galleries = createDrizzleGalleryRepository(db);
  const facts = await galleries.findProjectFacts(context, row.projectId);
  if (!facts) return false;
  const prepared = await prepareGalleryPassword(
    {
      cipher: deps.cipher,
      hasher: deps.hasher,
      passwords: { propose: () => generateGalleryPassword(deps.randomInt, facts.clientName) },
      newId: deps.newId,
    },
    context,
  );
  const outcome = await createGalleryForBooking(
    { galleries },
    context,
    row.actorId,
    row.projectId,
    prepared,
  );
  return outcome.ok && outcome.created;
}

/**
 * Creates the missing galleries of booked-or-later projects, one transaction per project. A second run
 * finds every project with a gallery and creates nothing (AC-GFL-005).
 * @param db - the database
 * @param deps - password ports (the production set is built from GALLERY_PASSWORD_KEY)
 * @param workspaceId - optional: limit the run to one workspace
 * @returns how many galleries were created and how many booked projects already had one
 */
export async function backfillGalleries(
  db: Db,
  deps: BackfillDeps,
  workspaceId?: string,
): Promise<BackfillCounts> {
  const rows = await listBookedProjects(db, workspaceId);
  let created = 0;
  for (const row of rows) {
    if (row.galleryId === null && (await backfillOne(db, deps, row))) created += 1;
  }
  return { created, skipped: rows.length - created };
}

function readEnv(): { databaseUrl: string; galleryPasswordKey: string } {
  config({ path: process.env.BACKFILL_ENV_FILE ?? ".dev.vars", quiet: true });
  if (process.env.APP_STAGE === "production") throw new Error("Refusing to backfill production.");
  const databaseUrl = process.env.DATABASE_URL;
  const galleryPasswordKey = process.env.GALLERY_PASSWORD_KEY;
  if (!databaseUrl) throw new Error("DATABASE_URL is missing (environment or .dev.vars).");
  if (!galleryPasswordKey)
    throw new Error("GALLERY_PASSWORD_KEY is missing (environment or .dev.vars).");
  return { databaseUrl, galleryPasswordKey };
}

async function main(): Promise<void> {
  const env = readEnv();
  console.log(`Backfilling galleries on ${new URL(env.databaseUrl).hostname}`);
  const { db, pool } = createDb(env.databaseUrl);
  try {
    const deps: BackfillDeps = {
      cipher: createWebCryptoGalleryPasswordCipher(env.galleryPasswordKey),
      hasher: createBetterAuthPasswordHasher(),
      randomInt: createWebCryptoRandomInt(),
      newId: () => crypto.randomUUID(),
    };
    const counts = await backfillGalleries(db, deps);
    console.log(
      `Galleries created: ${String(counts.created)}, skipped (already had one): ${String(counts.skipped)}`,
    );
  } finally {
    await pool.end();
  }
}

// Runs only as the entry point, so the integration test can import backfillGalleries.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
