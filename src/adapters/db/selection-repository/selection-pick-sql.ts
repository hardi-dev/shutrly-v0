import "server-only";

import { and, asc, eq } from "drizzle-orm";

import type {
  PickedPhotoRecord,
  PickWriter,
} from "@/features/gallery/application/ports/selection-repository/selection-repository.port";
import { PHOTO_KINDS } from "@/features/gallery/domain/photo-classification/photo-classification";
import { SOURCE_PROVIDERS } from "@/features/gallery/domain/source-provider/source-provider";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

import type { DbExecutor } from "../client/client.types";
import { PHOTO_SOURCE_JOIN, SOURCE_CONFIG_JOIN } from "../gallery-repository/gallery-photo-sql";
import { galleryPhoto, gallerySource } from "../schema/gallery/gallery";
import { photoSelection, selectionGroup } from "../schema/gallery/selection";
import { workspaceSourceConfig } from "../schema/gallery/workspace-source-config";

interface LockedGroupScope {
  readonly context: WorkspaceContext;
  readonly groupId: string;
  readonly galleryId: string;
}

/** A photo of the locked group's gallery with its pick facts (D-12, AC-SEL-006). @param tx - the transaction @param scope - workspace, group and gallery @param photoId - the photo id @returns the facts, or null for a photo outside the gallery */
async function findGroupPhoto(tx: DbExecutor, scope: LockedGroupScope, photoId: string) {
  const row = (
    await tx
      .select({
        kind: galleryPhoto.kind,
        missingAt: galleryPhoto.missingAt,
        removedAt: gallerySource.removedAt,
      })
      .from(galleryPhoto)
      .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
      .where(
        and(
          eq(galleryPhoto.workspaceId, scope.context.workspaceId),
          eq(galleryPhoto.galleryId, scope.galleryId),
          eq(galleryPhoto.id, photoId),
        ),
      )
  ).at(0);
  const kind = PHOTO_KINDS.find((candidate) => candidate === row?.kind);
  if (!row || !kind) return null;
  return { kind, missing: row.missingAt !== null, sourceRemoved: row.removedAt !== null };
}

/** The group's status writes under the lock: submitted by the client, locked by the Owner (BR-SEL-005, BR-AUD-001). @param tx - the transaction holding the group lock @param scope - workspace, group and its gallery @returns the status writer */
function groupStatusWriter(tx: DbExecutor, scope: LockedGroupScope) {
  const { context, groupId } = scope;
  const group = and(
    eq(selectionGroup.workspaceId, context.workspaceId),
    eq(selectionGroup.id, groupId),
  );
  return {
    async markLocked(actorId: string, at: Date) {
      await tx
        .update(selectionGroup)
        .set({ status: "LOCKED", lockedAt: at, lockedBy: actorId })
        .where(group);
    },
    async markSubmitted(at: Date) {
      await tx.update(selectionGroup).set({ status: "SUBMITTED", submittedAt: at }).where(group);
    },
  };
}

/** Pick writes for a group locked in `tx` (D-12). @param tx - the transaction holding the group lock @param scope - workspace, group and its gallery @returns the writer */
export function pickWriter(tx: DbExecutor, scope: LockedGroupScope): PickWriter {
  const { context, groupId } = scope;
  const pickOf = (photoId: string) =>
    and(
      eq(photoSelection.workspaceId, context.workspaceId),
      eq(photoSelection.selectionGroupId, groupId),
      eq(photoSelection.photoId, photoId),
    );
  return {
    findPhoto: (photoId) => findGroupPhoto(tx, scope, photoId),
    async findPick(photoId) {
      const rows = await tx
        .select({ quantity: photoSelection.quantity, note: photoSelection.note })
        .from(photoSelection)
        .where(pickOf(photoId));
      return rows.at(0) ?? null;
    },
    async insertPick(photoId, quantity) {
      await tx.insert(photoSelection).values({
        workspaceId: context.workspaceId,
        selectionGroupId: groupId,
        photoId,
        quantity,
      });
    },
    async updateQuantity(photoId, quantity) {
      await tx
        .update(photoSelection)
        .set({ quantity, updatedAt: new Date() })
        .where(pickOf(photoId));
    },
    async deletePick(photoId) {
      await tx.delete(photoSelection).where(pickOf(photoId));
    },
    async setNote(photoId, note) {
      await tx.update(photoSelection).set({ note, updatedAt: new Date() }).where(pickOf(photoId));
    },
    ...groupStatusWriter(tx, scope),
  };
}

/** Every pick of a project's groups with its photo facts, in group then file-name order (A-8, A-25). @param db - the executor @param context - verified workspace @param projectId - the project @returns the picks */
export async function selectPickedPhotos(
  db: DbExecutor,
  context: WorkspaceContext,
  projectId: string,
): Promise<readonly PickedPhotoRecord[]> {
  const rows = await db
    .select({
      groupId: photoSelection.selectionGroupId,
      photoId: photoSelection.photoId,
      quantity: photoSelection.quantity,
      note: photoSelection.note,
      fileName: galleryPhoto.fileName,
      folderPath: galleryPhoto.folderPath,
      externalFileId: galleryPhoto.externalFileId,
      provider: workspaceSourceConfig.provider,
      missingAt: galleryPhoto.missingAt,
    })
    .from(photoSelection)
    .innerJoin(
      selectionGroup,
      and(
        eq(selectionGroup.workspaceId, photoSelection.workspaceId),
        eq(selectionGroup.id, photoSelection.selectionGroupId),
      ),
    )
    .innerJoin(
      galleryPhoto,
      and(
        eq(galleryPhoto.workspaceId, photoSelection.workspaceId),
        eq(galleryPhoto.id, photoSelection.photoId),
      ),
    )
    .innerJoin(gallerySource, PHOTO_SOURCE_JOIN)
    .innerJoin(workspaceSourceConfig, SOURCE_CONFIG_JOIN)
    .where(
      and(
        eq(photoSelection.workspaceId, context.workspaceId),
        eq(selectionGroup.projectId, projectId),
      ),
    )
    .orderBy(
      asc(photoSelection.selectionGroupId),
      asc(galleryPhoto.nameSortKey),
      asc(galleryPhoto.id),
    );
  return rows.flatMap(({ missingAt, provider, ...row }) => {
    const known = SOURCE_PROVIDERS.find((candidate) => candidate === provider);
    return known ? [{ ...row, provider: known, missing: missingAt !== null }] : [];
  });
}
