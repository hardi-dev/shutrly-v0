import "server-only";

import { and, asc, eq, sql } from "drizzle-orm";

import type {
  GalleryProjectFacts,
  GallerySourceRecord,
  GallerySummaryRecord,
} from "@/features/gallery/application/ports/gallery-repository/gallery-repository.port";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { client } from "../schema/booking/client";
import { project } from "../schema/booking/project";
import { gallery, gallerySource } from "../schema/gallery/gallery";
import { workspaceSourceConfig } from "../schema/gallery/workspace-source-config";
import { toGalleryStatus, toProjectStatus, toSourceRecord } from "./gallery-rows";

/** Reads the project facts a gallery needs, optionally locking the project FOR SHARE (D-14). @param db - database or transaction @param context - verified workspace @param projectId - the project id @param lock - take FOR SHARE on the project row @returns the facts or null */
export async function selectProjectFacts(
  db: DbExecutor,
  context: WorkspaceContext,
  projectId: string,
  lock: boolean,
): Promise<GalleryProjectFacts | null> {
  const query = db
    .select({
      id: project.id,
      status: project.status,
      title: project.title,
      clientName: client.name,
    })
    .from(project)
    .innerJoin(
      client,
      and(eq(client.workspaceId, project.workspaceId), eq(client.id, project.clientId)),
    )
    .where(and(eq(project.workspaceId, context.workspaceId), eq(project.id, projectId)));
  const row = (lock ? await query.for("share", { of: project }) : await query).at(0);
  const status = row ? toProjectStatus(row.status) : null;
  if (!row || !status) return null;
  return { ...row, status };
}

const ACTIVE_SOURCES = sql<number>`(select count(*)::int from gallery_source s where s.workspace_id = "gallery"."workspace_id" and s.gallery_id = "gallery"."id" and s.removed_at is null)`;
const FAILED_SOURCES = sql<number>`(select count(*)::int from gallery_source s where s.workspace_id = "gallery"."workspace_id" and s.gallery_id = "gallery"."id" and s.removed_at is null and s.sync_status = 'FAILED')`;
// Photos of removed sources are hidden (BR-GAL-009); missing ones still count, flagged apart.
const FAILED_NAMES = sql<
  string[]
>`array(select coalesce(s.label, s.folder_name, '') from gallery_source s where s.workspace_id = "gallery"."workspace_id" and s.gallery_id = "gallery"."id" and s.removed_at is null and s.sync_status = 'FAILED' order by s.created_at, s.id)`;
const PHOTO_COUNTS = sql<string>`(select json_build_object(
  'proof', count(*) filter (where p.kind = 'PROOF'),
  'edited', count(*) filter (where p.kind = 'EDITED'),
  'print', count(*) filter (where p.kind = 'PRINT'),
  'missing', count(*) filter (where p.missing_at is not null))::text
  from gallery_photo p join gallery_source s on s.workspace_id = p.workspace_id and s.id = p.gallery_source_id
  where p.workspace_id = "gallery"."workspace_id" and p.gallery_id = "gallery"."id" and s.removed_at is null)`;

function parseCounts(text: string): GallerySummaryRecord["counts"] {
  const raw: unknown = JSON.parse(text);
  const read = (key: string) =>
    typeof raw === "object" && raw !== null && key in raw ? Number(Reflect.get(raw, key)) : 0;
  return {
    proof: read("proof"),
    edited: read("edited"),
    print: read("print"),
    missing: read("missing"),
  };
}

/** Reads a project's gallery with its source and photo counts. @param db - database or transaction @param context - verified workspace @param projectId - the project id @returns the summary or null when the project has no gallery */
export async function selectSummary(
  db: DbExecutor,
  context: WorkspaceContext,
  projectId: string,
): Promise<GallerySummaryRecord | null> {
  const row = (
    await db
      .select({
        row: gallery,
        active: ACTIVE_SOURCES,
        failed: FAILED_SOURCES,
        failedNames: FAILED_NAMES,
        counts: PHOTO_COUNTS,
      })
      .from(gallery)
      .where(and(eq(gallery.workspaceId, context.workspaceId), eq(gallery.projectId, projectId)))
  ).at(0);
  const status = row ? toGalleryStatus(row.row.status) : null;
  if (!row || !status) return null;
  const { row: g } = row;
  return {
    gallery: {
      id: g.id,
      status,
      password: {
        ciphertext: g.passwordCiphertext,
        iv: g.passwordIv,
        keyVersion: g.passwordKeyVersion,
      },
      passwordVersion: g.passwordVersion,
      expiresAt: g.expiresAt,
      expiryDays: g.expiryDays,
      publishedAt: g.publishedAt,
      archivedAt: g.archivedAt,
    },
    activeSourceCount: row.active,
    failedSourceCount: row.failed,
    failedSourceNames: row.failedNames,
    counts: parseCounts(row.counts),
  };
}

/** Lists a gallery's sources, removed ones included, oldest first. @param db - database or transaction @param context - verified workspace @param galleryId - the gallery id @returns the source records */
export async function selectSources(
  db: DbExecutor,
  context: WorkspaceContext,
  galleryId: string,
): Promise<GallerySourceRecord[]> {
  const rows = await db
    .select({ row: gallerySource, name: workspaceSourceConfig.displayName })
    .from(gallerySource)
    .innerJoin(
      workspaceSourceConfig,
      and(
        eq(workspaceSourceConfig.workspaceId, gallerySource.workspaceId),
        eq(workspaceSourceConfig.id, gallerySource.workspaceSourceId),
      ),
    )
    .where(
      and(
        eq(gallerySource.workspaceId, context.workspaceId),
        eq(gallerySource.galleryId, galleryId),
      ),
    )
    .orderBy(asc(gallerySource.createdAt), asc(gallerySource.id));
  return rows.map(({ row, name }) => toSourceRecord(row, name));
}
