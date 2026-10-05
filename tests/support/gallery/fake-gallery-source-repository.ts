/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  GallerySourceRepositoryPort,
  LockedGalleryState,
  NewGallerySource,
  SyncClaim,
  SyncStepResult,
} from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type {
  SyncedPhoto,
  SyncFailureCode,
} from "@/features/gallery/domain/sync-plan/sync-plan.types";
import type { SyncCursor } from "@/features/gallery/domain/sync-step/sync-step.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface FakeSource extends NewGallerySource {
  id: string;
  workspaceId: string;
  galleryId: string;
  removed: boolean;
  syncStatus: string;
  syncErrorCode: SyncFailureCode | null;
  startedAt: Date | null;
  leaseAt: Date | null;
  cursor: SyncCursor | null;
  folderName: string | null;
}

export interface FakePhoto extends SyncedPhoto {
  sourceId: string;
  missing: boolean;
}

export interface FakeGallery extends LockedGalleryState {
  workspaceId: string;
  passwordVersion: number;
  passwordHash: string;
  passwordChangedBy: string | null;
  archivedBy: string | null;
  deleted: boolean;
}

export class FakeGallerySourceRepository implements GallerySourceRepositoryPort {
  readonly galleries = new Map<string, FakeGallery>();
  readonly activeWorkspaceSources = new Set<string>();
  readonly sources: FakeSource[] = [];
  readonly photos: FakePhoto[] = [];
  /** Photo rows a step wrote (inserted or changed): an unchanged photo adds none (D-21). */
  photoWrites = 0;
  readonly otherProjectFolders = new Map<string, string[]>();
  private next = 0;

  addGallery(workspaceId: string, gallery: LockedGalleryState): void {
    this.galleries.set(gallery.galleryId, {
      ...gallery,
      workspaceId,
      passwordVersion: 1,
      passwordHash: "hash(mawar-4821)",
      passwordChangedBy: null,
      archivedBy: null,
      deleted: false,
    });
  }

  private lifecycle(gallery: FakeGallery) {
    const active = () =>
      this.sources.filter((row) => row.galleryId === gallery.galleryId && !row.removed);
    const set = (change: Partial<FakeGallery>) => {
      this.galleries.set(gallery.galleryId, {
        ...(this.galleries.get(gallery.galleryId) ?? gallery),
        ...change,
      });
    };
    return {
      countActiveSources: async () => active().length,
      removeSource: async (sourceId: string) => {
        const source = active().find((row) => row.id === sourceId);
        if (source) source.removed = true;
        return source !== undefined;
      },
      publish: async (expiry: { expiresAt: Date | null; expiryDays: number | null }) => {
        set({ status: "PUBLISHED", ...expiry });
      },
      setExpiry: async (expiry: { expiresAt: Date | null; expiryDays: number | null }) => {
        set(expiry);
      },
      rotatePassword: async (rotated: { passwordHash: string }, actorId: string) => {
        set({
          passwordHash: rotated.passwordHash,
          passwordVersion: gallery.passwordVersion + 1,
          passwordChangedBy: actorId,
        });
      },
      archive: async (actorId: string) => {
        set({ status: "ARCHIVED", archivedBy: actorId });
      },
      deleteGallery: async () => {
        set({ deleted: true });
      },
    };
  }

  readonly galleryByProject = new Map<string, string>();

  async findGalleryIdByProject(context: WorkspaceContext, projectId: string) {
    const id = this.galleryByProject.get(projectId) ?? null;
    return id !== null && this.galleries.get(id)?.workspaceId === context.workspaceId ? id : null;
  }

  async listActiveSources(context: WorkspaceContext, galleryId: string) {
    return this.sources
      .filter(
        (row) =>
          row.galleryId === galleryId && row.workspaceId === context.workspaceId && !row.removed,
      )
      .map((row) => ({ sourceId: row.id, name: row.folderName, folder: row.folder }));
  }

  async withLockedGallery<T>(
    context: WorkspaceContext,
    galleryId: string,
    work: Parameters<GallerySourceRepositoryPort["withLockedGallery"]>[2],
  ): Promise<T | "NOT_FOUND"> {
    const gallery = this.galleries.get(galleryId);
    if (!gallery || gallery.deleted || gallery.workspaceId !== context.workspaceId)
      return "NOT_FOUND";
    const writer = {
      ...this.lifecycle(gallery),
      isWorkspaceSourceActive: async (id: string) => this.activeWorkspaceSources.has(id),
      insertSource: async (source: NewGallerySource) => {
        const taken = this.sources.some(
          (row) =>
            row.galleryId === galleryId &&
            !row.removed &&
            row.folder.folderId === source.folder.folderId,
        );
        if (taken) return "FOLDER_ALREADY_LINKED" as const;
        this.next += 1;
        const id = `source-${String(this.next)}`;
        this.sources.push({
          ...source,
          id,
          workspaceId: context.workspaceId,
          galleryId,
          removed: false,
          syncStatus: "NEVER",
          syncErrorCode: null,
          startedAt: null,
          leaseAt: null,
          cursor: null,
          folderName: null,
        });
        return { sourceId: id };
      },
    };
    return (await work(gallery, writer)) as T;
  }

  async findFolderUse(_context: WorkspaceContext, _galleryId: string, folderId: string) {
    return this.otherProjectFolders.get(folderId) ?? [];
  }

  source(context: WorkspaceContext, sourceId: string): FakeSource | undefined {
    return this.sources.find(
      (row) => row.id === sourceId && row.workspaceId === context.workspaceId,
    );
  }

  async findSyncTarget(context: WorkspaceContext, sourceId: string) {
    const source = this.source(context, sourceId);
    const gallery = source ? this.galleries.get(source.galleryId) : undefined;
    if (!source || !gallery) return null;
    return {
      sourceId,
      galleryId: source.galleryId,
      folder: source.folder,
      removed: source.removed,
      runOpen: source.syncStatus === "SYNCING",
      gallery,
    };
  }

  async claimStep(
    context: WorkspaceContext,
    sourceId: string,
    now: Date,
  ): Promise<SyncClaim | null> {
    const source = this.source(context, sourceId);
    if (!source || source.removed) return null;
    const leaseHeld =
      source.leaseAt !== null && now.getTime() - source.leaseAt.getTime() < LEASE_MS;
    if (source.syncStatus === "SYNCING" && leaseHeld) return null;
    if (source.syncStatus !== "SYNCING") {
      Object.assign(source, { syncStatus: "SYNCING", startedAt: now, cursor: null });
    }
    source.leaseAt = now;
    return { sourceId, startedAt: source.startedAt ?? now, leaseAt: now, cursor: source.cursor };
  }

  private writePhotos(sourceId: string, photos: readonly SyncedPhoto[]) {
    for (const photo of photos) {
      const existing = this.photos.find(
        (row) => row.sourceId === sourceId && row.externalFileId === photo.externalFileId,
      );
      if (!existing) {
        this.photos.push({ ...photo, sourceId, missing: false });
        this.photoWrites += 1;
      } else if (changed(existing, photo)) {
        Object.assign(existing, photo, { missing: false });
        this.photoWrites += 1;
      }
    }
  }

  async commitStep(context: WorkspaceContext, claim: SyncClaim, step: SyncStepResult) {
    const source = this.source(context, claim.sourceId);
    if (!source || source.removed || source.leaseAt?.getTime() !== claim.leaseAt.getTime()) {
      return false;
    }
    this.writePhotos(source.id, step.photos);
    if (!step.done) {
      Object.assign(source, { cursor: step.cursor, leaseAt: null });
      return true;
    }
    const seen = new Set(step.cursor.seen);
    for (const photo of this.photos.filter((row) => row.sourceId === source.id)) {
      if (!seen.has(photo.externalFileId)) photo.missing = true;
    }
    Object.assign(source, {
      syncStatus: "SUCCEEDED",
      syncErrorCode: null,
      folderName: step.cursor.folderName,
      cursor: null,
      leaseAt: null,
    });
    return true;
  }

  async failRun(context: WorkspaceContext, _claim: SyncClaim, code: SyncFailureCode) {
    const source = this.source(context, _claim.sourceId);
    if (source) {
      Object.assign(source, {
        syncStatus: "FAILED",
        syncErrorCode: code,
        cursor: null,
        leaseAt: null,
      });
    }
  }
}

const LEASE_MS = 2 * 60 * 1000;

function changed(existing: FakePhoto, photo: SyncedPhoto): boolean {
  return (
    existing.missing ||
    existing.fileName !== photo.fileName ||
    existing.kind !== photo.kind ||
    existing.folderPath !== photo.folderPath ||
    existing.browsePath !== photo.browsePath
  );
}
/* eslint-enable @typescript-eslint/require-await -- end of the fake */
