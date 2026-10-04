/* eslint-disable @typescript-eslint/require-await -- the fake mirrors the asynchronous repository port */

import type {
  GallerySourceRepositoryPort,
  LockedGalleryState,
  NewGallerySource,
  SyncClaim,
  SyncSuccess,
} from "@/features/gallery/application/ports/gallery-source-repository/gallery-source-repository.port";
import type {
  SyncedPhoto,
  SyncFailureCode,
} from "@/features/gallery/domain/sync-plan/sync-plan.types";
import type { WorkspaceContext } from "@/shared/workspace-context/workspace-context.types";

export interface FakeSource extends NewGallerySource {
  id: string;
  workspaceId: string;
  galleryId: string;
  removed: boolean;
  syncStatus: string;
  syncErrorCode: SyncFailureCode | null;
  startedAt: Date | null;
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
      gallery,
    };
  }

  async claimSync(
    context: WorkspaceContext,
    sourceId: string,
    now: Date,
  ): Promise<SyncClaim | null> {
    const source = this.source(context, sourceId);
    if (!source || source.syncStatus === "SYNCING") return null;
    source.syncStatus = "SYNCING";
    source.startedAt = now;
    return { sourceId, startedAt: now };
  }

  async completeSync(context: WorkspaceContext, claim: SyncClaim, result: SyncSuccess) {
    const source = this.source(context, claim.sourceId);
    if (!source || source.removed) return false;
    const seen = new Set(result.photos.map((photo) => photo.externalFileId));
    for (const photo of this.photos.filter((row) => row.sourceId === source.id)) {
      photo.missing = !seen.has(photo.externalFileId);
    }
    for (const photo of result.photos) {
      const existing = this.photos.find(
        (row) => row.sourceId === source.id && row.externalFileId === photo.externalFileId,
      );
      if (existing) Object.assign(existing, photo, { missing: false });
      else this.photos.push({ ...photo, sourceId: source.id, missing: false });
    }
    Object.assign(source, {
      syncStatus: "SUCCEEDED",
      syncErrorCode: null,
      folderName: result.folderName,
    });
    return true;
  }

  async failSync(context: WorkspaceContext, claim: SyncClaim, code: SyncFailureCode) {
    const source = this.source(context, claim.sourceId);
    if (source) Object.assign(source, { syncStatus: "FAILED", syncErrorCode: code });
  }
}
/* eslint-enable @typescript-eslint/require-await -- end of the fake */
