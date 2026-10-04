import "server-only";

import type {
  GalleryCreateWriter,
  GalleryRepositoryPort,
  NewGallery,
} from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { gallery } from "../schema/gallery/gallery";
import { selectProjectFacts, selectSources, selectSummary } from "./gallery-read-sql";

function createWriter(db: DbExecutor, context: WorkspaceContext): GalleryCreateWriter {
  return {
    async insert(row: NewGallery) {
      // ON CONFLICT waits for a concurrent create of the same project, then skips (AC-GAL-004).
      const inserted = await db
        .insert(gallery)
        .values({
          id: row.id,
          workspaceId: context.workspaceId,
          projectId: row.projectId,
          passwordCiphertext: row.password.ciphertext,
          passwordIv: row.password.iv,
          passwordKeyVersion: row.password.keyVersion,
          passwordHash: row.passwordHash,
          expiresAt: row.expiresAt,
          expiryDays: row.expiryDays,
          createdBy: row.actorId,
          updatedBy: row.actorId,
        })
        .onConflictDoNothing({ target: gallery.projectId })
        .returning({ id: gallery.id });
      return inserted.length === 0 ? "ALREADY_EXISTS" : "CREATED";
    },
  };
}

/** Builds the Drizzle gallery repository on a request database or transaction (ADR-003, D-14). @param db - request database or transaction @returns the gallery repository port */
export function createDrizzleGalleryRepository(db: DbExecutor): GalleryRepositoryPort {
  return {
    findProjectFacts: (context, projectId) => selectProjectFacts(db, context, projectId, false),
    withProjectForGallery: (context, projectId, work) =>
      db.transaction(async (tx) => {
        const facts = await selectProjectFacts(tx, context, projectId, true);
        if (!facts) return "NOT_FOUND" as const;
        return work(facts, createWriter(tx, context));
      }),
    async findCard(context, projectId) {
      const facts = await selectProjectFacts(db, context, projectId, false);
      if (!facts) return null;
      return { project: facts, summary: await selectSummary(db, context, projectId) };
    },
    async findPage(context, projectId) {
      const facts = await selectProjectFacts(db, context, projectId, false);
      const summary = facts ? await selectSummary(db, context, projectId) : null;
      if (!facts || !summary) return null;
      const sources = await selectSources(db, context, summary.gallery.id);
      return { project: facts, summary, sources };
    },
  };
}
